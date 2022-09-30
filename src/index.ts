import fs from "fs";
import path from "path";
import util from "util";
import { allTokens } from "./lexer/tokens";
//var JisonLex = require("jison-lex");
var Jison = require("jison");
// try {
//   const data = fs.readFileSync(
//     path.resolve("./src/cool_files/testes.cl"),
//     "utf8"
//   );

//   const tokens: String[] = [];
//   let lexer = new Lexer();

//   allTokens.forEach((token) => {
//     lexer.addRule(token.regex, (char: string) => {
//       if (token.token) tokens.push(`${token.token} : ${char}`);
//     });
//   });

//   lexer.setInput(data).lex();

//   console.log(JSON.stringify(tokens, null, 2));
// } catch (e) {
//   console.error(e);
// }

try {
  const data = fs.readFileSync(
    path.resolve("./src/cool_files/palindrome.cl"),
    "utf8"
  );

  var grammar = {
    lex: {
      rules: allTokens.map((token) => [
        token.regex,
        !!token.token ? `return '${token.token}';` : "/**/",
      ]),
    },

    operators: [
      ["left", "+", "-"],
      ["left", "*", "/"],
      ["nonassoc", "LEQ", "LT", "EQUAL"],
      ["right", "NOT"],
      ["right", "ASSIGNMENT"],
      ["right", "ISVOID"],
      ["right", "COMPLEMENT"],
      ["right", "AT"],
      ["left", "DOT"],
    ],

    bnf: {
      program: [["classes", "return $1;"]],

      classes: [
        ["classes class SEMICOLON", "$$ = [...$1, $2]"],
        ["class SEMICOLON", "$$ = [$1]"],
      ],

      class: [
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
      ],

      feature_list: [
        ["feature_list feature SEMICOLON", "$$ = [...$1, $2]"],
        ["feature SEMICOLON", "$$ = [$1]"],
      ],

      feature: [
        ["method", "$$ = $1"],
        ["attribute", "$$ = $1"],
      ],

      attribute: [
        [
          "IDENTIFIER COLON TYPE",
          `
            $$ = {
              node_type: 'attribute',
              type: $3,
              id: $1,
            }
          `,
        ],
        [
          "IDENTIFIER COLON TYPE ASSIGNMENT expression",
          `
            $$ = {
              node_type: 'attribute',
              type: $3,
              id: $1,
              value: $5
            }
          `,
        ],
      ],

      method: [
        [
          "IDENTIFIER LPAREN parameters RPAREN COLON TYPE LBRAC expression RBRAC",
          `$$ = {
            node_type: 'method',
            type: $6,
            id: $1,
            body: $8,
            parameters: $3,
          }`,
        ],
        [
          "IDENTIFIER LPAREN RPAREN COLON TYPE LBRAC expression RBRAC",
          `$$ = {
            node_type: 'method',
            type: $5,
            id: $1,
            body: $7,
            parameters: [],
          }`,
        ],
      ],

      parameters: [
        ["parameter", "$$ = [$1]"],
        ["parameters COMMA parameter", "$$ = [...$1, $3]"],
      ],

      parameter: [
        [
          "IDENTIFIER COLON TYPE",
          `$$ = {
            node_type: 'parameter',
            type: $3,
            id: $1
          }`,
        ],
      ],

      expression: [
        ["constant", "$$ = $1"],
        ["identifier", "$$ = $1"],
        ["assignment", "$$ = $1"],
        ["dispatch", "$$ = $1"],
        ["if_expression", "$$ = $1"],
        ["while_expression", "$$ = $1"],
        ["block_expression", "$$ = $1"],
        ["let_expression", "$$ = $1"],
        ["case_expression", "$$ = $1"],
        ["new_expression", "$$ = $1"],
        ["isvoid_expression", "$$ = $1"],
        ["complement_expression", "$$ = $1"],
        ["not_expression", "$$ = $1"],
        ["arithmetic_expression", "$$ = $1"],
        ["comparision_expression", "$$ = $1"],
      ],

      assignment: [
        [
          "IDENTIFIER ASSIGNMENT expression",
          `$$ = {
            node_type: 'assignment',
            id: $1,
            value: $3
          }`,
        ],
      ],

      constant: [
        ["BOOLEAN", "$$ = $1"],
        ["INTEGER", "$$ = $1"],
        ["STRING", "$$ = $1"],
      ],

      identifier: [
        ["IDENTIFIER", "$$ = $1"],
        ["SELF", "$$ = $1"],
      ],

      block_expression: [
        [
          "LBRAC block_expr RBRAC",
          `$$ = {
              node_type: 'block',
              body: $2
          }`,
        ],
      ],

      block_expr: [
        ["block_expr expression SEMICOLON", `$$ = [...$1, $2]`],
        ["expression SEMICOLON", `$$ = [$1]`],
      ],

      dispatch: [
        [
          "expression DOT IDENTIFIER LPAREN arguments RPAREN",
          `
          $$ = {
            node_type: 'dispatch',
            left_expression: $1,
            type: 'SELF_TYPE',
            id: $3,
            parameters: $5,
          }
          `,
        ],
        [
          "IDENTIFIER LPAREN arguments RPAREN",
          `
          $$ = {
            node_type: 'dispatch',
            type: 'SELF_TYPE',
            left_expression: 'self',
            id: $1,
            parameters: $3,
          }
          `,
        ],
        [
          "expression AT TYPE DOT IDENTIFIER LPAREN arguments RPAREN",
          `
          $$ = {
            node_type: 'dispatch',
            type: $3,
            left_expression: $1,
            id: $5,
            parameters: $7,
          }
          `,
        ],
      ],

      arguments: [
        ["expression", "$$ = [$1]"],
        ["arguments COMMA expression", "$$ = [...$1, $3]"],
        ["empty", "$$ = []"],
      ],

      if_expression: [
        [
          "IF expression THEN expression ELSE expression FI",
          `
          $$ = {
            node_type: 'if',
            condition: $2,
            then: $4,
            else: $6
          }
          `,
        ],
      ],

      while_expression: [
        [
          "WHILE expression LOOP expression POOL",
          `
          $$ = {
            node_type: 'loop',
            condition: $2,
            body: $4,
          }
        `,
        ],
      ],

      let_expression: [
        [
          "LET let_multiple IN expression",
          `$$ = {
            node_type: 'let_block',
            items: $2,
            expression: $4
          }`,
        ],
      ],

      let_multiple: [
        ["let_multiple COMMA let_def", "$$ = [...$1, $3]"],
        ["let_def", "$$ = [$1]"],
      ],

      let_def: [
        [
          "IDENTIFIER COLON TYPE ASSIGNMENT expression",
          `$$ = {
            node_type: 'let',
            type: $3,
            id: $1,
            initialization: $5
          }`,
        ],
        [
          "IDENTIFIER COLON TYPE",
          `$$ = {
            node_type: 'let',
            type: $3,
            id: $1
          }`,
        ],
      ],

      case_expression: [
        [
          "CASE expression OF branchs ESAC",
          `$$ = {
            node_type: 'case',
            branchs: $4,
            expression: $2,
          }`,
        ],
      ],

      branchs: [
        ["branchs branch", "$$ = [...$1, $2]"],
        ["branch", "$$ = [$1]"],
      ],

      branch: [
        [
          "IDENTIFIER COLON TYPE ARROW expression SEMICOLON",
          `$$ = {
            node_type: 'case_branch',
            id: $1,
            type: $3,
            action: $5
          }`,
        ],
      ],

      new_expression: [
        [
          "NEW TYPE",
          `$$ = {
            node_type: 'new',
            type: $2
          }`,
        ],
      ],

      isvoid_expression: [
        [
          "ISVOID expression",
          `$$ = {
            node_type: 'isvoid',
            expression: $2
          }`,
        ],
      ],

      complement_expression: [
        [
          "COMPLEMENT expression",
          `$$ = {
            node_type: 'complement',
            expression: $2
          }`,
        ],
      ],

      not_expression: [
        [
          "NOT expression",
          `$$ = {
            node_type: 'not',
            expression: $2
          }`,
        ],
      ],

      arithmetic_expression: [
        [
          "expression arithmetic_operators expression",
          `$$ = {
            node_type: 'arithmetic',
            operator: $2,
            left_expression: $1,
            right_expression: $3,
          }`,
        ],
      ],

      arithmetic_operators: [
        ["PLUS", "$$ = $1"],
        ["MINUS", "$$ = $1"],
        ["TIMES", "$$ = $1"],
        ["DIVISION", "$$ = $1"],
      ],

      comparision_expression: [
        [
          "expression comparision_operators expression",
          `$$ = {
            node_type: 'comparision',
            operator: $2,
            left_expression: $1,
            right_expression: $3,
          }`,
        ],
      ],

      comparision_operators: [
        ["LEQ", "$$ = $1"],
        ["LT", "$$ = $1"],
        ["EQUAL", "$$ = $1"],
      ],

      empty: [["", "$$ = {}"]],
    },
  };

  var parser = new Jison.Parser(grammar);
  const result = parser.parse(data);

  console.log(util.inspect(result, false, null, true));

  //var lexer = new JisonLex(grammar.lex);
  //lexer.setInput(data);

  // let token = lexer.lex();

  // do {
  //   if (token !== "undefined") {
  //     console.log(`${token}`);
  //   }

  //   token = lexer.lex();
  // } while (token != lexer.EOF);
} catch (e) {
  console.error(e);
}
