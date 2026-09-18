import { comma_list, paren_list } from "../helpers.js";

// Session and maintenance commands that carry no query structure of their own.
export default {

  _utility_statement: $ => choice(
    $.analyze_statement,
    $.reindex_statement,
    $.listen_statement,
    $.notify_statement,
    $.discard_statement,
    $.checkpoint_statement,
    $.prepare_statement,
    $.execute_statement,
    $.deallocate_statement,
    $.do_statement,
    $.lock_statement,
    $.kill_statement,
    $.attach_statement,
    $.detach_statement,
    $.reassign_owned_statement,
  ),

  // Postgres `ANALYZE [VERBOSE] t (a, b)`, MySQL `ANALYZE TABLE t`
  analyze_statement: $ => prec.right(seq(
    $.keyword_analyze,
    optional($.keyword_verbose),
    optional($.keyword_table),
    comma_list(
      seq(
        $.object_reference,
        optional(alias($._column_list, $.list)),
      ),
    ),
  )),

  reindex_statement: $ => seq(
    $.keyword_reindex,
    optional(paren_list($.explain_option, true)),
    choice(
      $.keyword_index,
      $.keyword_table,
      $.keyword_schema,
      $.keyword_database,
      $.keyword_system,
    ),
    optional($.keyword_concurrently),
    $.object_reference,
  ),

  listen_statement: $ => seq(
    choice($.keyword_listen, $.keyword_unlisten),
    choice($.identifier, '*'),
  ),

  notify_statement: $ => prec.right(seq(
    $.keyword_notify,
    $.identifier,
    optional(
      seq(
        ',',
        alias($._literal_string, $.literal),
      ),
    ),
  )),

  discard_statement: $ => seq(
    $.keyword_discard,
    choice(
      $.keyword_all,
      $.keyword_plans,
      $.keyword_sequences,
      $.keyword_temporary,
      $.keyword_temp,
    ),
  ),

  checkpoint_statement: $ => $.keyword_checkpoint,

  prepare_statement: $ => seq(
    $.keyword_prepare,
    $.identifier,
    optional(paren_list($._type, true)),
    choice(
      seq(
        $.keyword_as,
        alias(
          choice($._dml_read, $._dml_write),
          $.statement,
        ),
      ),
      // MySQL `PREPARE stmt FROM 'SELECT ?'`
      seq(
        $.keyword_from,
        choice(
          alias($._literal_string, $.literal),
          $.identifier,
        ),
      ),
    ),
  ),

  // Postgres `EXECUTE p(1)`, MySQL `EXECUTE p USING @a`,
  // T-SQL `EXEC dbo.proc @a = 1, 'x'`
  execute_statement: $ => prec.right(seq(
    choice($.keyword_execute, $.keyword_exec),
    $.object_reference,
    optional(
      choice(
        paren_list($._expression),
        seq($.keyword_using, comma_list($._expression, true)),
        comma_list($.execute_argument, true),
      ),
    ),
  )),

  execute_argument: $ => choice(
    seq(
      field('name', $.identifier),
      '=',
      field('value', choice($.literal, $.identifier, $.keyword_default)),
    ),
    field('value', choice($.literal, $.identifier, $.keyword_default)),
  ),

  deallocate_statement: $ => seq(
    $.keyword_deallocate,
    optional($.keyword_prepare),
    choice($.identifier, $.keyword_all),
  ),

  do_statement: $ => seq(
    $.keyword_do,
    optional(seq($.keyword_language, $.identifier)),
    alias($._dollar_quoted_string, $.literal),
    optional(seq($.keyword_language, $.identifier)),
  ),

  lock_statement: $ => prec.right(seq(
    $.keyword_lock,
    optional($.keyword_table),
    optional($.keyword_only),
    comma_list($.object_reference, true),
    optional(
      seq(
        $.keyword_in,
        choice(
          seq($.keyword_access, $.keyword_share),
          seq($.keyword_row, $.keyword_share),
          seq($.keyword_row, $.keyword_exclusive),
          seq($.keyword_share, $.keyword_update, $.keyword_exclusive),
          $.keyword_share,
          seq($.keyword_share, $.keyword_row, $.keyword_exclusive),
          $.keyword_exclusive,
          seq($.keyword_access, $.keyword_exclusive),
        ),
        $.keyword_mode,
      ),
    ),
    optional($.keyword_nowait),
  )),

  // MySQL
  kill_statement: $ => seq(
    $.keyword_kill,
    optional(choice($.keyword_connection, $.keyword_query)),
    alias($._integer, $.literal),
  ),

  // SQLite
  attach_statement: $ => seq(
    $.keyword_attach,
    optional($.keyword_database),
    $._expression,
    $.keyword_as,
    $.identifier,
  ),

  detach_statement: $ => seq(
    $.keyword_detach,
    optional($.keyword_database),
    $.identifier,
  ),

  reassign_owned_statement: $ => seq(
    $.keyword_reassign,
    $.keyword_owned,
    $.keyword_by,
    comma_list($.identifier, true),
    $.keyword_to,
    $.identifier,
  ),

};
