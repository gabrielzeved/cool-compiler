// PRIMITIVES
const boolean = [["BOOLEAN", "$$ = $1"]];
const string = [["STRING", "$$ = $1"]];
const integer = [["INTEGER", "$$ = $1"]];

// IDENTIFIER
const id = [["IDENTIFIER", "$$ = $1"]];
const self = [["SELF", "$$ = $1"]];

//EXPRESSION

const expression = [
  ["boolean", "$$ = $1"],
  ["string", "$$ = $1"],
  ["integer", "$$ = $1"],
  ["id", "$$ = $1"],
  ["expression_group", "$$ = $1"],
  ["not", "$$ = $1"],
  ["equal", "$$ = $1"],
  ["less_or_equal", "$$ = $1"],
  ["less_than", "$$ = $1"],
  ["complement", "$$ = $1"],
  ["division", "$$ = $1"],
  ["times", "$$ = $1"],
  ["minus", "$$ = $1"],
  ["plus", "$$ = $1"],
  ["isvoid", "$$ = $1"],
  ["_new", "$$ = $1"],
  ["_case", "$$ = $1"],
  ["_let", "$$ = $1"],
  ["expression_block", "$$ = $1"],
  ["_while", "$$ = $1"],
  ["_if", "$$ = $1"],
  ["self_dispatch", "$$ = $1"],
  ["dispatch", "$$ = $1"],
  ["at_dispatch", "$$ = $1"],
  ["assignment", "$$ = $1"],
  ["self", "$$ = $1"],
];

const expression_group = [
  [
    "LPAREN expression RPAREN",
    `$$ = {
      node_type: 'group',
      expression: $2,
    }`,
  ],
];
const expression_block = [
  [
    "LBRAC block_expression RBRAC",
    `$$ = {
      node_type: 'block',
      body: $2
    }`,
  ],
];

const block_expression = [
  ["block_expression expression SEMICOLON", "$$ = [...$1, $2]"],
  ["expression SEMICOLON", "$$ = [$1]"],
];

//WHILE
const _while = [
  [
    "WHILE expression LOOP expression POOL",
    `$$ = {
      node_type: 'loop',
      condition: $2,
      body: $4,
    }`,
  ],
];

//IF
const _if = [
  [
    "IF expression THEN expression ELSE expression FI",
    `$$ = {
      node_type: 'if',
      condition: $2,
      then: $4,
      else: $6
    }`,
  ],
];

//DISPATCH
const self_dispatch = [
  [
    "id LPAREN _arguments_opt RPAREN",
    `$$ = {
      node_type: 'dispatch',
      type: 'SELF_TYPE',
      left_expression: 'self',
      id: $1,
      parameters: $3,
    }`,
  ],
];

const dispatch = [
  [
    "expression DOT id LPAREN _arguments_opt RPAREN",
    `$$ = {
      node_type: 'dispatch',
      left_expression: $1,
      type: 'SELF_TYPE',
      id: $3,
      parameters: $5,
    }`,
  ],
];

const at_dispatch = [
  [
    "expression AT TYPE DOT id LPAREN _arguments_opt RPAREN",
    `$$ = {
      node_type: 'dispatch',
      type: $3,
      left_expression: $1,
      id: $5,
      parameters: $7,
    }`,
  ],
];

const _arguments_opt = [
  ["_arguments", "$$ = $1"],
  ["empty", "$$ = $1"],
];

const _arguments = [
  ["_arguments COMMA expression", "$$ = [...$1, $3]"],
  ["expression", "$$ = [$1]"],
];

//ASSIGNMENT
const assignment = [
  [
    "id ASSIGNMENT expression",
    `$$ = {
      node_type: 'assignment',
      id: $1,
      value: $3
    }`,
  ],
];

//CASE
const _case = [
  [
    "CASE expression OF branches ESAC",
    `$$ = {
      node_type: 'case',
      branchs: $4,
      expression: $2,
    }`,
  ],
];

const branches = [
  ["branches branch", "$$ = [...$1, $2]"],
  ["branch", "$$ = [$1]"],
];

const branch = [
  [
    "id COLON TYPE ARROW expression SEMICOLON",
    `$$ = {
      node_type: 'case_branch',
      id: $1,
      type: $3,
      action: $5
    }`,
  ],
];

//LET
const _let = [
  [
    "LET _let_multiple IN expression",
    `$$ = {
      node_type: 'let_block',
      items: $2,
      expression: $4
    }`,
  ],
];

const _let_multiple = [
  ["_let_multiple COMMA _let_def", "$$ = [...$1, $3]"],
  ["_let_def", "$$ = [$1]"],
];

const _let_def = [
  [
    "id COLON TYPE ASSIGNMENT expression",
    `$$ = {
      node_type: 'let',
      type: $3,
      id: $1,
      initialization: $5
    }`,
  ],
  [
    "id COLON TYPE",
    `$$ = {
      node_type: 'let',
      type: $3,
      id: $1
    }`,
  ],
];

//OPERATORS
const not = [
  [
    "NOT expression",
    `$$ = {
      node_type: 'not',
      expression: $2
    }`,
  ],
];

const complement = [
  [
    "COMPLEMENT expression",
    `$$ = {
      node_type: 'complement',
      expression: $2
    }`,
  ],
];

const isvoid = [
  [
    "ISVOID expression",
    `$$ = {
      node_type: 'isvoid',
      expression: $2
    }`,
  ],
];

const _new = [
  [
    "NEW TYPE",
    `$$ = {
      node_type: 'new',
      type: $2
    }`,
  ],
];

//ARITHMETIC
const division = [
  [
    "expression DIVISION expression",
    `$$ = {
      node_type: 'arithmetic',
      operator: $2,
      left_expression: $1,
      right_expression: $3,
    }`,
  ],
];

const times = [
  [
    "expression TIMES expression",
    `$$ = {
      node_type: 'arithmetic',
      operator: $2,
      left_expression: $1,
      right_expression: $3,
    }`,
  ],
];

const minus = [
  [
    "expression MINUS expression",
    `$$ = {
      node_type: 'arithmetic',
      operator: $2,
      left_expression: $1,
      right_expression: $3,
    }`,
  ],
];

const plus = [
  [
    "expression PLUS expression",
    `$$ = {
      node_type: 'arithmetic',
      operator: $2,
      left_expression: $1,
      right_expression: $3,
    }`,
  ],
];

//COMPARISION
const equal = [
  [
    "expression EQUAL expression",
    `$$ = {
      node_type: 'comparision',
      operator: $2,
      left_expression: $1,
      right_expression: $3,
    }`,
  ],
];

const less_or_equal = [
  [
    "expression LEQ expression",
    `$$ = {
      node_type: 'comparision',
      operator: $2,
      left_expression: $1,
      right_expression: $3,
    }`,
  ],
];

const less_than = [
  [
    "expression LT expression",
    `$$ = {
      node_type: 'comparision',
      operator: $2,
      left_expression: $1,
      right_expression: $3,
    }`,
  ],
];

//FORMAL
const formal = [
  [
    "id COLON TYPE",
    `
    $$ = {
      node_type: 'formal',
      type: $3,
      id: $1,
    }`,
  ],
];

const formal_multiple = [
  ["formal_multiple COMMA formal", "$$ = [...$1, $3]"],
  ["formal", "$$ = [$1]"],
  ["empty", "$$ = []"],
];

//FEATURE
const feature = [
  [
    "id LPAREN formal_multiple RPAREN COLON TYPE LBRAC expression RBRAC",
    `$$ = {
      node_type: 'method',
      type: $6,
      id: $1,
      body: $8,
      parameters: $3,
    }`,
  ],

  ["attribute", "$$ = $1"],
];

const attribute = [
  [
    "id COLON TYPE ASSIGNMENT expression",
    `$$ = {
      node_type: 'attribute',
      type: $3,
      id: $1,
      initialization: $5
    }`,
  ],
  [
    "id COLON TYPE",
    `$$ = {
      node_type: 'attribute',
      type: $3,
      id: $1
    }`,
  ],
];

const feature_list = [
  ["feature_list feature SEMICOLON", "$$ = [...$1, $2]"],
  ["feature SEMICOLON", "$$ = [$1]"],
];

//CLASS
const _class = [
  [
    "CLASS TYPE LBRAC feature_list RBRAC",
    `$$ = {
      node_type: 'class',
      type: $2,
      body: $4
    }`,
  ],
  [
    "CLASS TYPE INHERITS TYPE LBRAC feature_list RBRAC",
    `$$ = {
      node_type: 'class',
      type: $2,
      inherits: $4,
      body: $6
    }`,
  ],
];

const classes = [
  ["classes _class SEMICOLON", "$$ = [...$1, $2]"],
  ["_class SEMICOLON", "$$ = [$1]"],
];

//PROGRAM
const program = [["classes", "return $1"]];

const empty = [["", "$$ = undefined"]];

export const bnf_definition = {
  program,

  classes,
  _class,

  feature_list,
  feature,
  _arguments,
  _arguments_opt,
  attribute,

  formal,
  formal_multiple,

  expression,

  assignment,

  at_dispatch,
  dispatch,
  self_dispatch,

  _if,
  _while,

  expression_block,
  block_expression,

  _let,
  _let_def,
  _let_multiple,

  _case,
  branch,
  branches,

  _new,
  isvoid,
  plus,
  minus,
  times,
  division,

  complement,
  less_than,
  less_or_equal,
  equal,

  not,
  expression_group,

  id,
  self,

  integer,
  string,
  boolean,

  empty,
};
