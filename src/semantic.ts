export type NodeType =
  | "group"
  | "block"
  | "loop"
  | "if"
  | "dispatch"
  | "assignment"
  | "case"
  | "case_branch"
  | "let_block"
  | "let"
  | "not"
  | "complement"
  | "isvoid"
  | "new"
  | "arithmetic"
  | "comparision"
  | "formal"
  | "method"
  | "attribute"
  | "class"
  | "string"
  | "boolean"
  | "integer"
  | "identifier";

// ----------------- NODES --------------------- //

export type Node = {
  node_type: NodeType;
  [key: string]: any;
};

export type IdentifierNode = Node & {
  value: string;
};

export type ClassNode = Node & {
  type: string;
  inherits?: string;
  body?: Node | Node[];
};

export type MethodNode = Node & {
  type: string;
  id: IdentifierNode;
  body: Node | Node[];
  parameters: FormalNode[];
};

export type FormalNode = Node & {
  type: string;
  id: IdentifierNode;
};

export type LetBlockNode = Node & {
  items: LetNode[];
  expression: Node;
};

export type LetNode = Node & {
  type: string;
  id: IdentifierNode;
  initialization?: Node;
};

export type StringNode = Node & {
  value: string;
};

export type BoolNode = Node & {
  value: string;
};

export type IntNode = Node & {
  value: string;
};

export type DispatchNode = Node & {
  type: string;
  left_expression: Node;
  id: IdentifierNode;
  parameters?: Node[];
};

export type BlockNode = Node & {
  body: Node[];
};

export type GroupNode = Node & {
  expression: Node;
};

export type LoopNode = Node & {
  condition: Node;
  body: Node;
};

export type IfNode = Node & {
  condition: Node;
  then: Node;
  else: Node;
};

export type AttributeNode = Node & {
  type: string;
  id: IdentifierNode;
  initialization?: Node;
};

export type ArithmeticNode = Node & {
  operator: "+" | "-" | "/" | "*";
  left_expression: Node;
  right_expression: Node;
};

export type AssignmentNode = Node & {
  id: IdentifierNode;
  value: Node;
};

export type ComparisionNode = Node & {
  operator: "<" | "<=" | "=";
  left_expression: Node;
  right_expression: Node;
};

export type CaseNode = Node & {
  branchs: CaseBranchNode[];
  expression: Node;
};

export type CaseBranchNode = Node & {
  id: IdentifierNode;
  type: string;
  action: Node;
};

export type NotNode = Node & {
  expression: Node;
};

export type ComplementNode = Node & {
  expression: Node;
};

export type IsvoidNode = Node & {
  expression: Node;
};

export type NewNode = Node & {
  type: string;
};

// ----------------- CHARACTER MAP VALUES --------------------- //

export type ClassMapValue = {
  name: string;
  inherits?: string;
  methods: Map<MethodMapValue>;
  attributes: Map<AttributeMapValue>;
};

export type MethodMapValue = {
  name: string;
  //LIST OF PARAMETER'S TYPES
  parameters: string[];
  returnType: string;
};

export type AttributeMapValue = {
  name: string;
  type: string;
};

// ----------------- CHARACTER MAP --------------------- //

export type Map<T> = { [key: string]: T };

export interface Scope {
  classes: Map<ClassMapValue>;
  self_type: string;
}

export class GlobalScope implements Scope {
  classes: Map<ClassMapValue> = {};
  self_type: string = "";

  private objectMethods = {
    abort: {
      name: "abort",
      returnType: "Object",
      parameters: [],
    },
    type_name: {
      name: "type_name",
      returnType: "String",
      parameters: [],
    },
    copy: {
      name: "copy",
      returnType: "Object",
      parameters: [],
    },
  };

  constructor() {
    this._Object();
    this._IO();
    this._Bool();
    this._Int();
    this._String();
  }

  _Object() {
    this.classes["Object"] = {
      name: "Object",
      methods: this.objectMethods,
      attributes: {},
    };
  }

  _IO() {
    this.classes["IO"] = {
      name: "IO",
      inherits: "Object",
      attributes: {},
      methods: {
        in_int: {
          name: "in_int",
          returnType: "Int",
          parameters: [],
        },
        in_string: {
          name: "in_string",
          returnType: "String",
          parameters: [],
        },
        out_int: {
          name: "out_int",
          returnType: "SELF_TYPE",
          parameters: ["Int"],
        },
        out_string: {
          name: "out_string",
          returnType: "SELF_TYPE",
          parameters: ["String"],
        },

        ...this.objectMethods,
      },
    };
  }

  _Bool() {
    this.classes["Bool"] = {
      attributes: {},
      name: "Bool",
      inherits: "Object",
      methods: {
        ...this.objectMethods,
      },
    };
  }

  _String() {
    this.classes["String"] = {
      attributes: {},
      name: "String",
      inherits: "Object",
      methods: {
        length: {
          name: "length",
          returnType: "Int",
          parameters: [],
        },
        concat: {
          name: "concat",
          returnType: "String",
          parameters: ["String"],
        },
        substr: {
          name: "substr",
          returnType: "String",
          parameters: ["Int", "Int"],
        },
        ...this.objectMethods,
      },
    };
  }

  _Int() {
    this.classes["Int"] = {
      attributes: {},
      name: "Int",
      inherits: "Object",
      methods: {
        ...this.objectMethods,
      },
    };
  }

  parse(data: Node[]) {
    data.forEach((node) => {
      if (node.node_type === "class") {
        this.parseClass(node as ClassNode);
      }
    });
  }

  parseClass(node: ClassNode) {
    this.classes[node.type] = {
      name: node.type,
      methods: {},
      inherits: node?.inherits ?? "Object",
      attributes: {},
    };

    if (node.body) {
      if (Array.isArray(node.body)) {
        node.body.forEach((bodyNode) => {
          if (bodyNode.node_type === "method")
            this.parseMethod(node.type, bodyNode as MethodNode);
        });
      } else {
        if (node.body.node_type === "method")
          this.parseMethod(node.type, node.body as MethodNode);
      }
    }
  }

  parseMethod(className: string, node: MethodNode) {
    if (!this.classes[className])
      throw new Error(`class ${className} is not defined`);

    const parameters = node.parameters.reduce<string[]>((prev, curr) => {
      return [...prev, curr.type];
    }, []);

    this.classes[className].methods[node.id.value] = {
      name: node.id.value,
      parameters,
      returnType: node.type,
    };
  }
}

export namespace Semantic {
  //TODO: alterar any
  export type AnalyzerFunction = (node: any, scope: Scope) => string;

  export const analyzers: Record<NodeType, AnalyzerFunction> = {
    let: _let,
    let_block,
    class: _class,
    string,
    boolean,
    integer,
    dispatch,
    method,
    block,
    group,
    loop,
    if: _if,
    attribute,
    identifier,
    arithmetic,
    assignment,
    comparision,
    case: _case,
    case_branch,
    not,
    complement,
    isvoid,
    new: _new,
    formal,
  };

  export function analyze(node: Node, scope: Scope) {
    //console.log(node);
    return analyzers[node.node_type](node, scope);
  }

  function formal(node: FormalNode, scope: Scope) {
    scope.classes[scope.self_type].attributes[node.id.value] = {
      name: node.id.value,
      type: node.type,
    };

    return node.type;
  }

  function _new(node: NewNode, scope: Scope) {
    assert(scope.classes[node.type], `${node.type} is not defined`);
    return node.type;
  }

  function isvoid(node: IsvoidNode, scope: Scope) {
    analyze(node.expression, scope);
    return "Bool";
  }

  function complement(node: ComplementNode, scope: Scope) {
    const returnType = analyze(node.expression, scope);
    assertIsAssignable("Int", returnType, scope);
    return "Int";
  }

  function not(node: NotNode, scope: Scope) {
    const returnType = analyze(node.expression, scope);
    assertIsAssignable("Bool", returnType, scope);
    return "Bool";
  }

  function _case(node: CaseNode, scope: Scope) {
    const action_types: string[] = [];
    node.branchs.forEach((branch) => {
      action_types.push(analyze(branch, scope));
    });

    assert(
      action_types.length > 0,
      `invalid case definition, must define at least one branch`
    );

    let returnType = action_types[0];
    for (let i = 1; i < action_types.length; i++) {
      returnType = findNearestParentClass(
        action_types[i - 1],
        action_types[i],
        scope
      );
    }
    return returnType;
  }

  function case_branch(node: CaseBranchNode, _scope: Scope) {
    const scope = structuredClone(_scope) as Scope;

    scope.classes[scope.self_type].attributes[node.id.value] = {
      name: node.id.value,
      type: node.type,
    };

    const returnType = analyze(node.action, scope);
    return returnType;
  }

  function comparision(node: ComparisionNode, scope: Scope) {
    const leftReturnType = analyze(node.left_expression, scope);
    const rightReturnType = analyze(node.right_expression, scope);

    if (["<", "<="].includes(node.operator)) {
      assertIsAssignable("Int", leftReturnType, scope);
      assertIsAssignable("Int", rightReturnType, scope);
    }

    const basic_types = ["Int", "Bool", "String"];
    if (
      basic_types.includes(leftReturnType) ||
      basic_types.includes(rightReturnType)
    ) {
      assert(
        leftReturnType === rightReturnType,
        `illegal comparision between ${leftReturnType} and ${rightReturnType}`
      );
    }

    return "Bool";
  }

  function assignment(node: AssignmentNode, scope: Scope) {
    const identifierType = analyze(node.id, scope);
    const expressionType = analyze(node.value, scope);
    assertIsAssignable(identifierType, expressionType, scope);
    return identifierType;
  }

  function arithmetic(node: ArithmeticNode, scope: Scope) {
    const leftReturnType = analyze(node.left_expression, scope);
    assertIsAssignable("Int", leftReturnType, scope);
    const rightReturnType = analyze(node.right_expression, scope);
    assertIsAssignable("Int", rightReturnType, scope);

    return "Int";
  }

  function attribute(node: AttributeNode, scope: Scope) {
    if (node.initialization) {
      const initializationType = analyze(node.initialization, scope);
      assertIsAssignable(node.type, initializationType, scope);
    }

    assert(
      !scope.classes[scope.self_type].attributes[node.id.value],
      `attribute ${node.id.value} already defined`
    );

    scope.classes[scope.self_type].attributes[node.id.value] = {
      name: node.id.value,
      type: node.type,
    };

    return node.type;
  }

  function identifier(node: IdentifierNode, scope: Scope) {
    if (node.value === "self") return scope.self_type!;

    assert(
      scope.classes[scope.self_type].attributes[node.value],
      `attribute ${node.value} is not defined`
    );
    return scope.classes[scope.self_type].attributes[node.value].type;
  }

  function _class(node: ClassNode, _scope: Scope) {
    const scope = structuredClone(_scope);
    (scope.self_type = node.type),
      // ADD CLASS METHODS INSIDE SCOPE
      (scope.methods = {
        ...scope.methods,
        ...scope.classes[node.type].methods,
      });

    node.inherits ??= "Object";

    assert(scope.classes[node.inherits], `${node.inherits} is not defined`);
    //TODO: ADD INHERITS METHODS INSIDE SCOPE
    scope.methods = {
      ...scope.classes[node.inherits].methods,
      ...scope.methods,
    };

    //ADD NEW METHODS TO THE MAIN SCOPE
    // _scope.classes[node.type].methods = {
    //   ..._scope.classes[node.inherits].methods,
    //   ..._scope.classes[node.type].methods,
    // };

    scope.classes[node.type].methods = {
      ...scope.classes[node.inherits].methods,
      ...scope.classes[node.type].methods,
    };

    if (node.body) {
      if (Array.isArray(node.body)) {
        node.body.forEach((bodyNode) => {
          analyze(bodyNode, scope);
        });
      } else {
        analyze(node.body, scope);
      }
    }

    return node.type;
  }

  function _let(node: LetNode, scope: Scope) {
    if (node.initialization) {
      const initializationType = analyze(node.initialization, scope);
      assertIsAssignable(node.type, initializationType, scope);
    }

    assert(
      !scope.classes[scope.self_type].attributes[node.id.value],
      `attribute ${node.id.value} already defined`
    );

    scope.classes[scope.self_type].attributes[node.id.value] = {
      name: node.id.value,
      type: node.type,
    };

    return node.type;
  }

  function let_block(node: LetBlockNode, _scope: Scope) {
    const scope = structuredClone(_scope);

    node.items.forEach((itemNode) => {
      analyze(itemNode, scope);
    });

    return analyze(node.expression, scope);
  }

  //TODO: add AT dispatch
  function dispatch(node: DispatchNode, scope: Scope) {
    const leftExpressionType = analyze(node.left_expression, scope);

    assert(
      scope.classes[leftExpressionType],
      `class ${leftExpressionType} is not defined`
    );

    assertHasMethod(node.id.value, leftExpressionType, scope);

    const method = getMethod(node.id.value, leftExpressionType, scope)!;

    node.parameters?.forEach((parameter, index) => {
      const expectedType = method.parameters[index];
      const expressionType = analyze(parameter, scope);

      assertIsAssignable(expectedType, expressionType, scope);
    });

    return method.returnType;
  }

  function method(node: MethodNode, _scope: Scope) {
    const scope = structuredClone(_scope);

    let returnType: string = "";

    const formals: string[] = [];

    node.parameters.forEach((parameter) => {
      assert(
        !formals.includes(parameter.id.value),
        `parameter "${parameter.id.value}" is defined multiply times in method "${node.id.value}"`
      );

      formals.push(parameter.id.value);
      analyze(parameter, scope);
    });

    if (Array.isArray(node.body)) {
      node.body.forEach((bodyNode) => {
        returnType = analyze(bodyNode, scope);
      });
    } else {
      returnType = analyze(node.body, scope);
    }

    assertIsAssignable(node.type, returnType, scope);

    return node.type;
  }

  function block(node: BlockNode, _scope: Scope) {
    const scope = structuredClone(_scope);

    let returnType: string = "";

    node.body.forEach((bodyNode) => {
      returnType = analyze(bodyNode, scope);
    });

    return returnType;
  }

  function string(node: StringNode, _: Scope) {
    assert(typeof node.value === "string", `${node.value} is not a string`);
    return "String";
  }

  function boolean(node: BoolNode, _: Scope) {
    assert(
      node.value === "true" || node.value === "false",
      `${node.value} is not a boolean`
    );
    return "Bool";
  }

  function integer(node: IntNode, _: Scope) {
    assert(
      Number.isInteger(Number(node.value)),
      `${node.value} is not a integer`
    );
    return "Int";
  }

  function group(node: GroupNode, scope: Scope) {
    return analyze(node.expression, scope);
  }

  function loop(node: LoopNode, _scope: Scope) {
    const conditionType = analyze(node.condition, _scope);
    assertIsAssignable("Bool", conditionType, _scope);

    analyze(node.body, _scope);
    return "Object";
  }

  function _if(node: IfNode, scope: Scope) {
    const conditionType = analyze(node.condition, scope);
    assertIsAssignable("Bool", conditionType, scope);

    const thenType = analyze(node.then, scope);
    const elseType = analyze(node.else, scope);

    const returnType = findNearestParentClass(thenType, elseType, scope);
    return returnType;
  }

  function findNearestParentClass(
    _type1: string,
    _type2: string,
    scope: Scope
  ) {
    let type1 = _type1 === "SELF_TYPE" ? scope.self_type! : _type1;
    let type2 = _type2 === "SELF_TYPE" ? scope.self_type! : _type2;

    if (type1 === type2) return type1;

    const primitives = ["Int", "String", "Bool", "IO", "Object"];

    if (primitives.includes(type1) || primitives.includes(type2))
      return "Object";

    const path1 = pathToObject(type1, scope);
    const path2 = pathToObject(type2, scope);

    for (const parent of path1) {
      if (path2.includes(parent)) return parent;
    }
    return "Object";
  }

  function pathToObject(type: string, scope: Scope) {
    let currentType: string | undefined = type;
    const path = [type];

    while (!!currentType) {
      path.push(currentType);
      currentType = scope.classes[currentType].inherits;
    }
    return path;
  }

  function assertIsAssignable(_superType: string, type: string, scope: Scope) {
    let initialType = type === "SELF_TYPE" ? scope.self_type! : type;
    let superType = _superType === "SELF_TYPE" ? scope.self_type! : _superType;

    assert(scope.classes[superType], `${superType} is not defined`);
    assert(scope.classes[initialType], `${initialType} is not defined`);

    let currentType: string | undefined = initialType;

    while (!!currentType) {
      if (currentType === superType) return true;
      currentType = scope.classes[currentType].inherits;
    }

    throw new Error(
      `type "${initialType}" is not assignable to type "${superType}"`
    );
  }

  function assertHasMethod(methodName: string, type: string, scope: Scope) {
    let currentType: string | undefined =
      type === "SELF_TYPE" ? scope.self_type : type;

    while (!!currentType) {
      const isMethodOwner = Object.keys(
        scope.classes[currentType].methods
      ).includes(methodName);
      if (isMethodOwner) return;

      currentType = scope.classes[currentType].inherits;
    }

    throw new Error(
      `method ${methodName} is not defined inside the class ${type}`
    );
  }

  function getMethod(methodName: string, type: string, scope: Scope) {
    let currentType: string | undefined =
      type === "SELF_TYPE" ? scope.self_type : type;

    while (!!currentType) {
      const isMethodOwner = Object.keys(
        scope.classes[currentType].methods
      ).includes(methodName);
      if (isMethodOwner) return scope.classes[currentType].methods[methodName];

      currentType = scope.classes[currentType].inherits;
    }
    return null;
  }

  function assert(value: any, message: string) {
    if (!value) throw new Error(message);
  }

  function structuredClone(value: any) {
    return JSON.parse(JSON.stringify(value));
  }
}
