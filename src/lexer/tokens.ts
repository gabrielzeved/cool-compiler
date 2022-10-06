type OperatorToken =
  | "PLUS"
  | "MINUS"
  | "TIMES"
  | "DIVISION"
  | "ASSIGNMENT"
  | "ISVOID"
  | "NOT"
  | "LEQ"
  | "LT"
  | "EQUAL"
  | "AT"
  | "NOT"
  | "DOT"
  | "COMPLEMENT"
  | "ARROW";

type TypesToken =
  | "CLASS"
  | "INTEGER"
  | "STRING"
  | "IDENTIFIER"
  | "SELF_TYPE"
  | "TYPE"
  | "BOOLEAN";

type KeywordToken =
  | "INHERITS"
  | "ELSE"
  | "FI"
  | "IF"
  | "IN"
  | "LET"
  | "LOOP"
  | "POOL"
  | "THEN"
  | "WHILE"
  | "CASE"
  | "ESAC"
  | "NEW"
  | "OF"
  | "SELF";

type Token = OperatorToken | KeywordToken | TypesToken | SymbolToken;

type TokenDefinition = {
  regex: string | RegExp;
  token?: Token;
};

type SymbolToken =
  | "LBRAC"
  | "RBRAC"
  | "LPAREN"
  | "RPAREN"
  | "COLON"
  | "SEMICOLON"
  | "COMMA";

const symbols: [string, SymbolToken][] = [
  [`\\{`, "LBRAC"],
  [`\\}`, "RBRAC"],
  [`\\(`, "LPAREN"],
  [`\\)`, "RPAREN"],
  [`;`, "SEMICOLON"],
  [`\\:`, "COLON"],
  [`,`, "COMMA"],
];

const SymbolsTokens = symbols.map((token) => {
  return {
    regex: token[0],
    token: token[1],
  } as TokenDefinition;
});

const operators: [string, OperatorToken][] = [
  ["isvoid\\b", "ISVOID"],
  ["not\\b", "NOT"],
  ["<-", "ASSIGNMENT"],
  ["=>", "ARROW"],
  ["<=", "LEQ"],
  ["-", "MINUS"],
  ["<", "LT"],
  ["=", "EQUAL"],
  ["@", "AT"],
  ["~", "COMPLEMENT"],
  ["/", "DIVISION"],
  ["\\.", "DOT"],
  ["\\*", "TIMES"],
  ["\\+", "PLUS"],
];

const OperatorsTokens = operators.map((op) => {
  return {
    regex: op[0],
    token: op[1],
  } as TokenDefinition;
});

const keywords: [string, KeywordToken][] = [
  ["self\\b", "SELF"],
  ["inherits\\b", "INHERITS"],
  ["else\\b", "ELSE"],
  ["fi\\b", "FI"],
  ["if\\b", "IF"],
  ["in\\b", "IN"],
  ["let\\b", "LET"],
  ["loop\\b", "LOOP"],
  ["pool\\b", "POOL"],
  ["then\\b", "THEN"],
  ["while\\b", "WHILE"],
  ["case\\b", "CASE"],
  ["esac\\b", "ESAC"],
  ["new\\b", "NEW"],
  ["of\\b", "OF"],
];

const KeywordsTokens = keywords.map((kw) => {
  return {
    regex: kw[0],
    token: kw[1],
  } as TokenDefinition;
});

// const SelfTypeToken: TokenDefinition = {
//   regex: "SELF_TYPE\\b",
//   token: "SELF_TYPE",
// };

const ClassToken: TokenDefinition = {
  regex: "class",
  token: "CLASS",
};

const WhiteSpaceToken: TokenDefinition = {
  regex: `\f|\r|\t|\v|\ `,
};

const TypeToken: TokenDefinition = {
  regex: "[A-Z][A-Za-z_0-9]*",
  token: "TYPE",
};

const IdentifierToken: TokenDefinition = {
  regex: "[a-z][A-Za-z_0-9]*",
  token: "IDENTIFIER",
};

const StringToken: TokenDefinition = {
  regex: '"(.*?)"',
  token: "STRING",
};

const IntegerToken: TokenDefinition = {
  regex: "[0-9]+",
  token: "INTEGER",
};

const BooleanToken: TokenDefinition = {
  regex: "(true|false)",
  token: "BOOLEAN",
};

const LineCommentToken: TokenDefinition = {
  regex: "--.*\n?",
};

const MultiLineCommentToken: TokenDefinition = {
  regex: "\\(\\*.*?\\*\\)",
};

const NewLineToken: TokenDefinition = {
  regex: `\n+`,
};

export const allTokens: TokenDefinition[] = [
  //MultiLineToken,
  MultiLineCommentToken,
  LineCommentToken,

  BooleanToken,

  ClassToken,
  ...KeywordsTokens,

  TypeToken,
  IdentifierToken,

  StringToken,
  IntegerToken,

  ...OperatorsTokens,

  ...SymbolsTokens,
  WhiteSpaceToken,
  NewLineToken,
];
