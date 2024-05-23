// grammar.js

const builtin = require('./builtin');

// TODO fix examples
// TODO separate rule for comment delimiters
// TODO separate rule for fn call invoke position
// TODO separate rule for metadata :doc "string"
// TODO separate rule for operators
// TODO add more field declarations
// TODO specify supertypes
// TODO work on keyword extraction
// TODO support tree-sitter highlight
// TODO support blob maps, hex strings?

module.exports = grammar({
  name: 'convex',

  // An array of tokens that may appear anywhere in the language. Used to ignore whitespace and
  // comments.
  extras: ($) => [
    $._whitespace,
    $.comment,
  ],

  // The name of a token that will match keywords for the purpose of keyword extraction
  // optimization.
  word: ($) => $._builtin_function,

  // An array of rule names that should be automatically removed from the grammar by replacing them
  // with a copy of their definition.
  inline: ($) => [
    $._symbol,
  ],

  rules: {
    convex: ($) => repeat($._sexp),

    _sexp: ($) => choice(
      $.lookup,
      $.import,
      $.defmacro,
      $.defn,
      $.def,
      $.cond,
      $.fn,
      $.macro,
      $.let,
      $.iflet,
      $.whenlet,
      $.dotimes,
      $.loop,
      $.list,
      $.vector,
      $.set,
      $.map,
      $._atom,
      $.quote,
      $.quasiquote,
      $.unquote,
    ),

    lookup: ($) =>
      choice(
        // #42/x, addr/x
        seq(
          field("account", choice($.address, $.symbol)),
          $._lookup_separator,
          field("name", $.symbol),
        ),
        // (lookup x), (lookup #42 x), (lookup addr x)
        seq(
          "(lookup",
          // If omitted, the account is implicitly taken to be the current one.
          optional(field("account", choice($.address, $.symbol))),
          field("name", $.symbol),
          ")",
        ),
      ),

    quote: ($) =>
      choice(
        // 'foo, ':foo, '(), '{}, '[], '#{}, etc.
        seq("'", $._sexp),
        // (quote foo), (quote :foo), (quote ()), (quote {}), (quote []), (quote #{}), etc.
        seq(
          "(quote",
          $._sexp,
          ")",
        ),
      ),

    quasiquote: ($) =>
      choice(
        seq("`", $._sexp),
        seq(
          "(quasiquote",
          $._sexp,
          ")",
        ),
      ),

    unquote: ($) =>
      choice(
        seq("~", $._sexp),
        seq(
          "(unquote",
          $._sexp,
          ")",
        ),
      ),

    import: ($) =>
      seq(
        "(import",
        field("name", $.symbol),
        optional(
          seq($._as, field("rename", $.symbol)),
        ),
        ")",
      ),

    _as: ($) =>
      token(
        ":as"
      ),

    defmacro: ($) =>
      seq(
        "(defmacro",
        field("name", $.symbol),
        field("meta", optional($.metadata)),
        field("body", $.arity),
        ")",
      ),

    defn: ($) =>
      seq(
        "(defn",
        field("name", $.symbol),
        field("meta", optional($.metadata)),
        choice(
          // regular function
          $.arity,
          // multi-function
          repeat1(
            seq(
              "(",
              $.arity,
              ")",
            ),
          ),
        ),
        ")",
      ),

    def: ($) =>
      seq(
        "(def",
        field("name", $.symbol),
        field("meta", optional($.metadata)),
        field("body", $._sexp),
        ")",
      ),

    fn: ($) =>
      seq(
        "(fn",
        $.arity,
        ")",
      ),

    macro: ($) =>
      seq(
        "(macro",
        $.arity,
        ")",
      ),

    arity: ($) =>
      seq(
        field("args", $.parameters),
        //field("docs", optional($.doc)),
        field("body", $._sexp),
      ),

    cond: ($) =>
      seq(
        "(cond",
        // empty (cond) returns nil
        optional(
          choice(
            // (cond <test>) returns the test result
            $._cond_test,
            seq(
              repeat1($._cond_pair),
              optional(field("fallback", $._sexp))
            ),
          ),
        ),
        ")",
      ),

    _cond_test: ($) =>
      field("test", $._sexp),

    _cond_pair: ($) =>
      seq(
        field("test", $._sexp),
        field("result", $._sexp),
      ),


    let: ($) =>
      seq(
        "(let",
        $.bindings,
        repeat($._sexp),
        ")",
      ),

    // TODO if

    iflet: ($) =>
      seq(
        "(if-let",
        $._binding1,
        field("true", $._sexp),
        field("false", optional($._sexp)),
        ")",
      ),

    whenlet: ($) =>
      seq(
        "(when-let",
        $._binding1,
        field("body", repeat($._sexp)),
        ")",
      ),

    dotimes: ($) =>
      seq(
        "(dotimes",
        $._binding1,
        field("body", repeat($._sexp)),
        ")",
      ),

    loop: ($) =>
      seq(
        "(loop",
        $.bindings,
        field("body", repeat($._sexp)),
        ")",
      ),

    bindings: ($) =>
      seq(
        "[",
        repeat($.binding),
        "]",
      ),

    _binding1: ($) =>
      seq(
        "[",
        $.binding,
        "]",
      ),

    binding: ($) =>
      seq(
        field("name", $.symbol),
        field("expr", $._sexp),
      ),

    parameters: ($) =>
      seq(
        "[",
        optional(repeat($.fixed)),
        optional($._var_args),
        "]",
      ),

    // A fixed-place parameter.
    fixed: ($) =>
      $._symbol,

    _var_args: ($) =>
      seq(
        $.var_marker,
        repeat1($.optional),
      ),

    var_marker: ($) =>
      token(
        "&"
      ),

    // An optional parameter.
    optional: ($) =>
      $._symbol,

    _atom: ($) =>
      choice(
        $.nil_lit,
        $.boolean,
        $.character,
        $.string,
        $.blob,
        $.long,
        $.float,
        $.keyword,
        $.symbol,
      ),

    nil_lit: ($) =>
      token(
        "nil"
      ),

    boolean: ($) =>
      token(
        field("value", choice("true", "false")),
      ),

    character: ($) =>
      seq(
        '\\',
        choice(
          'backspace',
          'formfeed',
          'newline',
          'return',
          'space',
          'tab',
          // Unicode code units: \uXXXX
          /u[0-9a-fA-F]{4}/,
          /./
        ),
      ),

    string: ($) =>
      seq(
        '"',
        repeat(
          choice(
            /[^"\\]/,
            seq(
              "\\", /(.|\n)/
            )
          )
        ),
        '"',
      ),

    blob: ($) =>
      choice(
        $.address,
        $.bytes,
      ),

    bytes: ($) =>
      token(
        /0x([0-9a-fA-F]{2})+/
      ),

    long: ($) =>
      token(
        /[+-]?[0-9]+\.?/
      ),

    float: ($) =>
      choice(
        $.nan,
        $.inf,
        $._float_dec,
        $._float_exp,
        $._float_decexp,
      ),

    nan: ($) =>
      token(
        "##NaN"
      ),

    // ±∞
    inf: ($) =>
      token(
        /##-?Inf/
      ),

    // float with decimal
    _float_dec: ($) =>
      token(
        /[+-]?[0-9]*\.[0-9]+/
      ),

    // float with exponent
    _float_exp: ($) =>
      token(
        /[+-]?[0-9]+[eE][0-9]+/
      ),

    // float with decimal and exponent
    _float_decexp: ($) =>
      token(
        /[+-]?[0-9]*\.[0-9]+[eE][0-9]+/
      ),

    // Keywords are composed of 1 to 64 characters prefixed by ":" and without spaces.
    keyword: ($) =>
      seq(
        $._keyword_prefix,
        $._symbol,
      ),

    // NB: an address is a blob data-type.
    address: ($) =>
      token(
        /#\d+/
      ),

    symbol: ($) =>
      $._symbol,

    list: ($) =>
      seq(
        "(",
        repeat($._sexp),
        ")",
      ),

    vector: ($) =>
      seq(
        "[",
        repeat($._sexp),
        "]"
      ),

    set: ($) =>
      seq(
        "#{",
        repeat($._sexp),
        "}"
      ),

    map: ($) =>
      seq(
        "{",
        repeat($._pair),
        "}",
      ),

    _pair: ($) =>
      seq(
        $._sexp,
        $._sexp,
      ),

    metadata: ($) =>
      seq(
        $.meta_prefix,
        $.map,
      ),

    // An internal rule shared by 'symbol' and 'keyword' and which is inlined.
    _symbol: ($) =>
      choice(
        $._builtin_symbol,
        token(
          /[^~#\d\s\n\f()\[\]{}\"\'`\\;:\/]{1,64}/
        ),
      ),

    _builtin_symbol: ($) =>
      builtin.symbols,

    _builtin_function: ($) =>
      builtin.functions,

    // Each hex byte is two hex digits.
    _hex_byte: ($) =>
      token(
        /[0-9a-fA-F]{2}/
      ),

    _lookup_separator: ($) =>
      token(
        '/'
      ),

    _keyword_prefix: ($) =>
      token(
        ':'
      ),

    meta_prefix: ($) =>
      token(
        '^'
      ),

    // NB: commas are whitespace.
    _whitespace: ($) =>
      token(
        /\s|\f|,/
      ),

    comment: ($) =>
      token(
        seq(';', /.*/)
      ),
  }
});
