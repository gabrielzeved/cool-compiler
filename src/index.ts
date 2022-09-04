import fs from "fs";
//@ts-expect-error js module
import Lexer from "lex";
import path from "path";
import { allTokens } from "./lexer/tokens";

try {
  const data = fs.readFileSync(
    path.resolve("./src/cool_files/palindrome.cl"),
    "utf8"
  );

  const tokens: String[] = [];
  let lexer = new Lexer();

  allTokens.forEach((token) => {
    lexer.addRule(token.regex, (char: string) => {
      if (token.token) tokens.push(`${token.token} : ${char}`);
    });
  });

  lexer.setInput(data).lex();

  console.log(JSON.stringify(tokens, null, 2));
} catch {}
