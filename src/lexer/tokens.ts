// type OperationToken = "PLUS" | "MINUS" | "TIMES" | "DIVISION";
// type TypeToken = "CLASS" | "INTEGER" | "STRING" | "IDENTIFIER" | ""

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
  regex: string;
  token?: Token;
};

const symbols = [`\\{`, `\\}`, `\\(`, `\\)`, `;`, `\\:`, `,`];

const SymbolsTokens = symbols.map((char) => {
  return {
    regex: char,
    token: "SYMBOL",
  } as TokenDefinition;
});

const operators = [
  "isvoid",
  "not",
  "=>",
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

const OperatorsTokens = operators.map((op) => {
  return {
    regex: op,
    token: "OPERATOR",
  } as TokenDefinition;
});

const keywords = [
  "inherits",
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

const KeywordsTokens = keywords.map((kw) => {
  return {
    regex: kw,
    token: "KEYWORD",
  } as TokenDefinition;
});

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

const KeywordToken: TokenDefinition = {
  regex: `(${keywords.join("|")})`,
  token: "KEYWORD",
};

const LineCommentToken: TokenDefinition = {
  regex: "--.*$",
};

const NewLineToken: TokenDefinition = {
  regex: `\n+`,
};

export const allTokens: TokenDefinition[] = [
  //MultiLineToken,
  LineCommentToken,

  BooleanToken,

  ClassToken,
  //InheritsToken,

  TypeToken,
  IdentifierToken,

  StringToken,
  IntegerToken,

  ...KeywordsTokens,
  ...OperatorsTokens,

  ...SymbolsTokens,
  WhiteSpaceToken,
  NewLineToken,
];
