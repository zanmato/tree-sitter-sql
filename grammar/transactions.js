export default {

  transaction: $ => prec.dynamic(1, seq(
    $.keyword_begin,
    optional(
      $.keyword_transaction,
    ),
    optional(';'),
    repeat(
      seq(
        $.statement,
        ';'
      ),
    ),
    choice(
      $._commit,
      $._rollback,
    ),
  )),

  _commit: $ => seq(
    $.keyword_commit,
    optional(
      $.keyword_transaction,
    ),
  ),

  _rollback: $ => seq(
    $.keyword_rollback,
    optional(
      $.keyword_transaction,
    ),
  ),

  // Transaction control issued on its own, the way an interactive client
  // sends it. `transaction` still wins when a BEGIN is closed in the same input.
  transaction_statement: $ => choice(
    seq(
      $.keyword_begin,
      optional(choice($.keyword_transaction, $.keyword_work)),
      optional($._transaction_mode),
    ),
    seq(
      $.keyword_start,
      $.keyword_transaction,
      optional($._transaction_mode),
    ),
    seq(
      choice($.keyword_commit, $.keyword_rollback, $.keyword_abort),
      optional(choice($.keyword_transaction, $.keyword_work)),
    ),
  ),

  savepoint_statement: $ => choice(
    seq($.keyword_savepoint, $.identifier),
    seq($.keyword_release, optional($.keyword_savepoint), $.identifier),
    seq(
      $.keyword_rollback,
      optional(choice($.keyword_transaction, $.keyword_work)),
      $.keyword_to,
      optional($.keyword_savepoint),
      $.identifier,
    ),
  ),

};
