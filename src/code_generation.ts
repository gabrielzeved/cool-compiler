import {
  Argument,
  Function,
  Instruction as InstructionBril,
  Label,
  Program,
  Type,
} from "./lib/bril-ts/bril";
import {
  ArithmeticNode,
  AssignmentNode,
  AttributeNode,
  BlockNode,
  BoolNode,
  ClassNode,
  ComparisionNode,
  DispatchNode,
  GlobalScope,
  IdentifierNode,
  IfNode,
  IntNode,
  LetBlockNode,
  LetNode,
  LoopNode,
  MethodNode,
  NewNode,
  Node,
  Scope,
} from "./semantic";

type Instruction = InstructionBril | Label;

interface BrilInstruction {
  instructions: Instruction[];
  returnType: string;
  destination: string;
}

let temp_var = 0;
const lets: { [key: string]: string } = {};

function coolType2BrilType(type: string): Type {
  if (type === "Int") return "int";
  else if (type === "Bool") return "bool";
  else return { ptr: "int" };
}

function findFirstParentMethodDefinition(
  methodName: string,
  classType: string,
  scope: Scope
): string | null {
  let currentType: string | undefined =
    classType === "SELF_TYPE" ? scope.self_type : classType;

  while (!!currentType) {
    const isMethodOwner = Object.keys(
      scope.classes[currentType].methods
    ).includes(methodName);
    if (isMethodOwner) return currentType;

    currentType = scope.classes[currentType].inherits;
  }

  return null;
}

const main_instance: Instruction[] = [
  {
    dest: "size",
    op: "const",
    type: "int",
    value: 1,
  },
  {
    args: ["size"],
    dest: "this",
    op: "alloc",
    type: {
      ptr: "int",
    },
  },
  {
    op: "call",
    type: { ptr: "int" },
    funcs: [`Main__constructor`],
    args: ["this"],
    dest: "this",
  },
];

function methodBril(node: MethodNode, scope: Scope): [Function, string] {
  const name =
    node.id.value === "main" && scope.self_type === "Main"
      ? "main"
      : `${scope.self_type}__${node.id.value}`;

  const nodes = Array.isArray(node.body) ? node.body : [node.body];

  const instructions: Instruction[] = [];
  const args: Argument[] = [];

  if (name === "main") {
    instructions.push(...main_instance);
  } else {
    args.push({ name: "this", type: { ptr: "int" } });
  }

  let _return;

  nodes.forEach((node) => {
    const instr = nodeToInstruction(node, scope);
    _return = instr.destination;
    instructions.push(...instr.instructions);
  });

  const ret: Instruction | undefined = _return
    ? {
        args: [_return],
        op: "ret",
      }
    : undefined;

  if (name === "main") {
    instructions.push({ args: ["this"], op: "free" });
  }

  return [
    {
      name,
      args,
      instrs: ret ? [...instructions, ret] : instructions,
      type: coolType2BrilType(node.type),
    },
    node.type,
  ];
}

export type ResolverFunction = (node: any, scope: Scope) => BrilInstruction;

const resolvers: { [key: string]: ResolverFunction } = {
  integer: intBril,
  boolean: booleanBril,
  dispatch: dispatchBril,
  let: letBril,
  let_block: letBlockBril,
  block: blockBril,
  identifier: identifierBril,
  arithmetic: arithmeticBril,
  loop: loopBril,
  comparision: comparisionBril,
  assignment: assignmentBril,
  if: ifBril,
  new: newBril,
  attribute: attributeBril,
};

function nodeToInstruction(node: Node, scope: Scope): BrilInstruction {
  return resolvers[node.node_type as keyof typeof resolvers](node, scope);
}

function attributeBril(node: AttributeNode, scope: Scope): BrilInstruction {
  scope.classes[scope.self_type].attributes[node.id.value] = {
    name: node.id.value,
    type: node.type,
  };

  const instructions: Instruction[] = [];

  const index = Object.keys(
    scope.classes[scope.self_type].attributes
  ).findIndex((attr) => attr === node.id.value);

  if (index < 0) {
    throw new Error("Attribute not defined");
  }

  const destination = `attribute_index_${index}`;

  instructions.push({
    dest: `this_${temp_var}`,
    op: "const",
    type: "int",
    value: index,
  });

  instructions.push({
    args: ["this", `this_${temp_var}`],
    dest: destination,
    op: "ptradd",
    type: {
      ptr: "int",
    },
  });

  if (node.initialization) {
    const initialization = nodeToInstruction(node.initialization, scope);

    instructions.push(...initialization.instructions);

    instructions.push({
      args: [destination, initialization.destination],
      op: "store",
    });
  }

  return {
    instructions: instructions,
    returnType: node.type,
    destination: destination,
  };
}

function newBril(node: NewNode, scope: Scope): BrilInstruction {
  const instructions: Instruction[] = [];

  const destination = `new_${temp_var}`;

  const attributes = Object.values(
    scope.classes[scope.self_type].attributes
  ).filter((attribute) => attribute.type === node.type);

  instructions.push({
    dest: `${destination}_size`,
    op: "const",
    type: "int",
    value: Math.max(attributes.length, 1),
  });

  instructions.push({
    args: [`${destination}_size`],
    dest: destination,
    op: "alloc",
    type: {
      ptr: "int",
    },
  });

  instructions.push({
    op: "call",
    type: { ptr: "int" },
    funcs: [`${node.type}__constructor`],
    args: [destination],
    dest: destination,
  });

  return {
    destination,
    instructions,
    returnType: node.type,
  };
}

function ifBril(node: IfNode, scope: Scope): BrilInstruction {
  const instructions: Instruction[] = [];
  const condition = nodeToInstruction(node.condition, scope);
  const then = nodeToInstruction(node.then, scope);
  const _else = nodeToInstruction(node.else, scope);

  instructions.push({
    label: `if_condition_${temp_var}`,
  });

  instructions.push(...condition.instructions);

  instructions.push({
    args: [condition.destination],
    labels: [`if_then_${temp_var}`, `if_else_${temp_var}`],
    op: "br",
  });

  instructions.push({
    label: `if_then_${temp_var}`,
  });

  instructions.push(...then.instructions);

  instructions.push({
    args: [then.destination],
    dest: `if_return_${temp_var}`,
    op: "id",
    type: coolType2BrilType(then.returnType),
  });

  instructions.push({
    labels: [`if_exit_${temp_var}`],
    op: "jmp",
  });

  instructions.push({
    label: `if_else_${temp_var}`,
  });

  instructions.push(..._else.instructions);

  instructions.push({
    args: [_else.destination],
    dest: `if_return_${temp_var}`,
    op: "id",
    type: coolType2BrilType(_else.returnType),
  });

  instructions.push({
    labels: [`if_exit_${temp_var}`],
    op: "jmp",
  });

  instructions.push({
    label: `if_exit_${temp_var}`,
  });

  temp_var++;

  return {
    destination: `if_return_${temp_var}`,
    instructions: instructions,
    returnType: then.returnType,
  };
}

function loopBril(node: LoopNode, scope: Scope): BrilInstruction {
  const instructions: Instruction[] = [];

  const condition = nodeToInstruction(node.condition, scope);
  const body = nodeToInstruction(node.body, scope);

  instructions.push({
    label: `loop_condition_${temp_var}`,
  });

  instructions.push(...condition.instructions);

  instructions.push({
    args: [condition.destination],
    labels: [`loop_body_${temp_var}`, `loop_finish_${temp_var}`],
    op: "br",
  });

  instructions.push({
    label: `loop_body_${temp_var}`,
  });

  instructions.push(...body.instructions);

  instructions.push(
    {
      labels: [`loop_condition_${temp_var}`],
      op: "jmp",
    },
    {
      label: "loop_finish_" + temp_var,
    }
  );

  temp_var++;

  return {
    destination: condition.destination,
    returnType: condition.returnType,
    instructions,
  };
}

function identifierBril(node: IdentifierNode, scope: Scope): BrilInstruction {
  const instructions: Instruction[] = [];

  if (node.value === "self") {
    return {
      instructions: [],
      destination: "this",
      returnType: scope.self_type,
    };
  }

  // CLASS ATTRIBUTE
  if (
    Object.keys(scope.classes[scope.self_type].attributes).includes(node.value)
  ) {
    const index = Object.keys(
      scope.classes[scope.self_type].attributes
    ).findIndex((attr) => attr === node.value);

    instructions.push(
      {
        dest: `temp_${temp_var}`,
        op: "const",
        type: "int",
        value: 0,
      },
      {
        args: ["this", `temp_${temp_var}`],
        dest: `attribute_index_${index}`,
        op: "ptradd",
        type: {
          ptr: "int",
        },
      },
      {
        args: [`attribute_index_${index}`],
        dest: node.value,
        op: "load",
        type: "int",
      }
    );

    temp_var++;
  }
  //THIS NEEDS TO CHANGE
  return {
    instructions,
    returnType:
      scope.classes[scope.self_type].attributes[node.value]?.type ||
      lets[node.value],
    destination: node.value,
  };
}

function blockBril(node: BlockNode, scope: Scope): BrilInstruction {
  const instructions: Instruction[] = [];
  let returnType: string;
  let destination: string;

  for (const _node of node.body) {
    const instr = nodeToInstruction(_node, scope);
    instructions.push(...instr.instructions);
    returnType = instr.returnType;
    destination = instr.destination;
  }

  return {
    instructions,
    returnType: returnType!,
    destination: destination!,
  };
}

function letBlockBril(node: LetBlockNode, scope: Scope): BrilInstruction {
  const instructions: Instruction[] = [];

  for (const _let of node.items) {
    const instr = nodeToInstruction(_let, scope);
    instructions.push(...instr.instructions);
  }

  const instr = nodeToInstruction(node.expression, scope);
  instructions.push(...instr.instructions);

  return {
    instructions,
    returnType: instr.returnType,
    destination: instr.destination,
  };
}

function assignmentBril(node: AssignmentNode, scope: Scope): BrilInstruction {
  const value = nodeToInstruction(node.value, scope);
  const instructions: Instruction[] = [];
  instructions.push(...value.instructions);

  const identifier = nodeToInstruction(node.id, scope);
  instructions.push(...identifier.instructions);
  const id = identifier.destination;

  const isAttribute = Object.keys(
    scope.classes[scope.self_type].attributes
  ).includes(id);

  if (isAttribute) {
    const index = Object.keys(
      scope.classes[scope.self_type].attributes
    ).findIndex((attr) => attr === id);

    instructions.push({
      args: [`attribute_index_${index}`, value.destination],
      op: "store",
    });
  } else {
    instructions.push({
      args: [value.destination],
      dest: id,
      op: "id",
      type: coolType2BrilType(value.returnType),
    });
  }

  return {
    destination: id,
    instructions,
    returnType: value.returnType,
  };
}

function letBril(node: LetNode, scope: Scope): BrilInstruction {
  const instructions: Instruction[] = [];

  const identifier = nodeToInstruction(node.id, scope);
  instructions.push(...identifier.instructions);
  const id = identifier.destination;

  if (!node.initialization) {
    if (node.type == "Int") {
      instructions.push({
        dest: id,
        op: "const",
        type: "int",
        value: 0,
      });
      lets[id] = "Int";
    } else if (node.type == "Bool") {
      instructions.push({
        dest: id,
        op: "const",
        type: "bool",
        value: false,
      });
      lets[id] = "Bool";
    } else {
      lets[id] = node.type;
    }
  } else {
    const {
      destination,
      returnType,
      instructions: nodeInstructions,
    } = nodeToInstruction(node.initialization, scope);

    instructions.push(...nodeInstructions);

    instructions.push({
      args: destination ? [destination] : [],
      dest: id,
      op: "id",
      type: coolType2BrilType(returnType),
    });

    lets[id] = returnType;
  }

  return {
    instructions: instructions,
    returnType: node.type,
    destination: id,
  };
}

function intBril(node: IntNode, scope: Scope): BrilInstruction {
  const destination = `temp_${temp_var++}`;

  const instruction: Instruction = {
    dest: destination,
    op: "const",
    type: "int",
    value: Number(node.value),
  };

  return {
    instructions: [instruction],
    destination,
    returnType: "Int",
  };
}

function booleanBril(node: BoolNode, scope: Scope): BrilInstruction {
  const destination = `temp_${temp_var++}`;

  const instruction: Instruction = {
    dest: destination,
    op: "const",
    type: "bool",
    value: Boolean(node.value),
  };

  return {
    instructions: [instruction],
    destination,
    returnType: "Bool",
  };
}

function comparisionBril(node: ComparisionNode, scope: Scope): BrilInstruction {
  const destination = `temp_${temp_var++}`;

  const leftExpression = nodeToInstruction(node.left_expression, scope);
  const rightExpression = nodeToInstruction(node.right_expression, scope);

  const operations = {
    "<": "lt",
    "<=": "le",
    "=": "eq",
  } as const;

  const instructions: Instruction[] = [];
  instructions.push(...leftExpression.instructions);
  instructions.push(...rightExpression.instructions);

  instructions.push({
    args: [leftExpression.destination, rightExpression.destination],
    dest: destination,
    op: operations[node.operator],
    type: "bool",
  });

  return {
    destination,
    instructions,
    returnType: "Bool",
  };
}

function arithmeticBril(node: ArithmeticNode, scope: Scope): BrilInstruction {
  const destination = `temp_${temp_var++}`;

  const leftExpression = nodeToInstruction(node.left_expression, scope);
  const rightExpression = nodeToInstruction(node.right_expression, scope);

  const operations = {
    "+": "add",
    "-": "sub",
    "*": "mul",
    "/": "div",
  } as const;

  const instructions: Instruction[] = [];
  instructions.push(...leftExpression.instructions);
  instructions.push(...rightExpression.instructions);

  instructions.push({
    args: [leftExpression.destination, rightExpression.destination],
    dest: destination,
    op: operations[node.operator],
    type: "int",
  });

  return {
    destination,
    instructions,
    returnType: "Int",
  };
}

function dispatchBril(node: DispatchNode, scope: Scope): BrilInstruction {
  const instructions: Instruction[] = [];

  const identifier = nodeToInstruction(node.id, scope);
  instructions.push(...identifier.instructions);
  const id = identifier.destination;

  const left_expression = nodeToInstruction(node.left_expression, scope);

  //MUDAR PARA TIPAGEM DO LEFT EXPRESSION
  const methodClass = findFirstParentMethodDefinition(
    id,
    left_expression.returnType,
    scope
  );

  if (!methodClass) throw new Error("Semantic error!");

  const methodReturnType = scope.classes[methodClass].methods[id].returnType;

  const destination = `temp_${temp_var++}`;

  const args = node.parameters?.reduce<string[]>((prev, curr) => {
    const inst = nodeToInstruction(curr, scope);
    const dest = inst.destination;

    instructions.push(...inst.instructions);

    if (dest) {
      return [...prev, dest];
    } else {
      return [...prev];
    }
  }, []);

  const instruction: Instruction = {
    op: "call",
    type: coolType2BrilType(methodReturnType),
    funcs: [`${methodClass}__${id}`],
    args: [left_expression.destination, ...(args ?? [])],
    dest: destination,
  };

  instructions.push(instruction);

  return {
    instructions,
    returnType: methodReturnType,
    destination,
  };
}

export function generateCode(data: ClassNode[], scope: GlobalScope): Program {
  const functions: Function[] = [];

  data.forEach((node) => {
    if (node.node_type !== "class") return;

    const newScope = {
      ...scope,
      self_type: (node as ClassNode).type,
    };

    if (node.body) {
      const body = Array.isArray(node.body) ? node.body : [node.body];

      const attributes: BrilInstruction[] = [];

      body.forEach((bodyNode) => {
        if (bodyNode.node_type === "method") {
          functions.push(methodBril(bodyNode as MethodNode, newScope)[0]);
        } else if (bodyNode.node_type === "attribute") {
          attributes.push(attributeBril(bodyNode as AttributeNode, newScope));
        }
      });

      const instructions = attributes.reduce<Instruction[]>(
        (prev, attr) => [...prev, ...attr.instructions],
        []
      );

      instructions.push({
        args: ["this"],
        op: "ret",
      });

      functions.push({
        name: `${node.type}__constructor`,
        instrs: instructions,
        args: [{ name: "this", type: { ptr: "int" } }],
        type: { ptr: "int" },
      });
    }
  });

  const out_int: Function = {
    args: [
      { name: "this", type: { ptr: "int" } },
      {
        name: "number",
        type: "int",
      },
    ],
    instrs: [
      {
        args: ["number"],
        op: "print",
      },
      {
        args: ["this"],
        op: "ret",
      },
    ],
    name: "IO__out_int",
    type: { ptr: "int" },
  };

  return {
    functions: [out_int, ...functions],
  };
}
