type Token =
  | "CLASS"
  | "IDENTIFIER"
  | "TYPE"
  | "INHERITS"
  | "SYMBOL"
  | "STRING"
  | "INTEGER"
  | "KEYWORD"
  | "OPERATOR"
  | "BOOLEAN";

type TokenDefinition = {
  regex: RegExp;
  token?: Token;
};

const symbols = "{}();:,";

const operators = [
  "isvoid",
  "not",
  "<-",
  "<=",
  "-",
  "<",
  "=",
  "@",
  "~",
  "/",
  "\\.",
  "\\*",
  "\\+",
];

const keywords = [
  "else",
  "fi",
  "if",
  "in",
  "let",
  "loop",
  "pool",
  "then",
  "while",
  "case",
  "esac",
  "new",
  "of",
];

const ClassToken: TokenDefinition = {
  regex: /(class)/,
  token: "CLASS",
};

const InheritsToken: TokenDefinition = {
  regex: /(inherits)/,
  token: "INHERITS",
};

const WhiteSpaceToken: TokenDefinition = {
  regex: /[\n\f\t\r\v\s]+/,
};

const TypeToken: TokenDefinition = {
  regex: /[A-Z][A-Za-z0-9_]*/,
  token: "TYPE",
};

const IdentifierToken: TokenDefinition = {
  regex: /[a-z][A-Za-z0-9_]*/,
  token: "IDENTIFIER",
};

const SymbolToken: TokenDefinition = {
  regex: new RegExp(`[${symbols}]`),
  token: "SYMBOL",
};

const StringToken: TokenDefinition = {
  regex: /"(.*?)"/,
  token: "STRING",
};

const IntegerToken: TokenDefinition = {
  regex: /[0-9]+/,
  token: "INTEGER",
};

const OperatorToken: TokenDefinition = {
  regex: new RegExp(`(${operators.join("|")})`),
  token: "OPERATOR",
};

const BooleanToken: TokenDefinition = {
  regex: /(true|false)/,
  token: "BOOLEAN",
};

const KeywordToken: TokenDefinition = {
  regex: new RegExp(`(${keywords.join("|")})`),
  token: "KEYWORD",
};

export const allTokens: TokenDefinition[] = [
  KeywordToken,
  OperatorToken,
  BooleanToken,

  ClassToken,
  InheritsToken,

  TypeToken,
  IdentifierToken,

  StringToken,
  IntegerToken,

  SymbolToken,
  WhiteSpaceToken,
];
