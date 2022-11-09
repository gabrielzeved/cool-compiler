import fs from "fs";
import path from "path";
import { allTokens } from "./lexer/tokens";
import { bnf_definition } from "./parser";
import { GlobalScope, Node, Semantic } from "./semantic";
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
      ["right", "ASSIGNMENT"],
      ["right", "NOT"],
      ["nonassoc", "LEQ", "LT", "EQUAL"],
      ["left", "PLUS", "MINUS"],
      ["left", "TIMES", "DIVISION"],
      ["right", "ISVOID"],
      ["right", "COMPLEMENT"],
      ["right", "AT"],
      ["left", "DOT"],
    ],

    bnf: bnf_definition,
  };

  var parser = new Jison.Parser(grammar);
  const result = parser.parse(data);

  const globalScope = new GlobalScope();
  globalScope.parse(result);

  result.forEach((node: Node) => {
    Semantic.analyze(node, globalScope);
  });

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
