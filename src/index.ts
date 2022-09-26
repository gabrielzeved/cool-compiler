import fs from "fs";
import path from "path";
import { allTokens } from "./lexer/tokens";
var JisonLex = require("jison-lex");

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
        `return '${token.token}';`,
      ]),
    },

    operators: [
      ["left", "+", "-"],
      ["left", "*", "/"],
      ["left", "^"],
      ["left", "UMINUS"],
    ],

    bnf: {},
  };

  // var parser = new Jison.Parser(grammar);
  // parser.parse("(5 + 3 - 5) * 8");

  var lexer = new JisonLex(grammar.lex);
  lexer.setInput(data);

  let token = lexer.lex();

  do {
    if (token !== "undefined") {
      console.log(`${token}`);
    }

    token = lexer.lex();
  } while (token != lexer.EOF);
} catch (e) {
  console.error(e);
}
