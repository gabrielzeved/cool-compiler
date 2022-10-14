import fs from "fs";
import path from "path";
import util from "util";
import { allTokens } from "./lexer/tokens";
import { bnf_definition } from "./parser";

var Jison = require("jison");

try {
  const data = fs.readFileSync(
    path.resolve("./src/cool_files/testes.cl"),
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
      ["left", "PLUS", "MINUS"],
      ["left", "TIMES", "DIVISION"],
      ["nonassoc", "LEQ", "LT", "EQUAL"],
      ["right", "NOT"],
      ["right", "ASSIGNMENT"],
      ["right", "ISVOID"],
      ["right", "COMPLEMENT"],
      ["right", "AT"],
      ["left", "DOT"],
    ],

    bnf: bnf_definition,
  };

  var parser = new Jison.Parser(grammar);
  const result = parser.parse(data);

  console.log(util.inspect(result, false, null, true));
} catch (e) {
  console.error(e);
}
