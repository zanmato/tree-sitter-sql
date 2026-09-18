import { comma_list, paren_list } from "../helpers.js";

export default {

  grant_statement: $ => prec.right(seq(
    $.keyword_grant,
    comma_list($.privilege, true),
    optional($._privilege_target),
    $.keyword_to,
    comma_list($.grantee, true),
    optional(
      seq(
        $.keyword_with,
        choice($.keyword_grant, $.keyword_admin),
        $.keyword_option,
      ),
    ),
    optional(
      seq(
        $.keyword_granted,
        $.keyword_by,
        $.grantee,
      ),
    ),
  )),

  revoke_statement: $ => prec.right(seq(
    $.keyword_revoke,
    optional(
      seq(
        choice($.keyword_grant, $.keyword_admin),
        $.keyword_option,
        $.keyword_for,
      ),
    ),
    comma_list($.privilege, true),
    optional($._privilege_target),
    $.keyword_from,
    comma_list($.grantee, true),
    optional(
      seq(
        $.keyword_granted,
        $.keyword_by,
        $.grantee,
      ),
    ),
    optional($._drop_behavior),
  )),

  // A bare identifier covers role membership (`GRANT admin TO joe`) and
  // engine specific privileges such as MySQL's `PROCESS`.
  privilege: $ => seq(
    choice(
      seq($.keyword_all, optional($.keyword_privileges)),
      $.keyword_select,
      $.keyword_insert,
      $.keyword_update,
      $.keyword_delete,
      $.keyword_truncate,
      $.keyword_references,
      $.keyword_trigger,
      $.keyword_create,
      $.keyword_alter,
      $.keyword_drop,
      $.keyword_index,
      $.keyword_connect,
      $.keyword_temporary,
      $.keyword_temp,
      $.keyword_execute,
      $.keyword_usage,
      $.keyword_set,
      $.identifier,
    ),
    optional(alias($._column_list, $.list)),
  ),

  _privilege_target: $ => seq(
    $.keyword_on,
    optional(
      choice(
        $.keyword_table,
        $.keyword_sequence,
        $.keyword_database,
        $.keyword_domain,
        $.keyword_function,
        $.keyword_procedure,
        $.keyword_routine,
        $.keyword_language,
        $.keyword_schema,
        $.keyword_tablespace,
        $.keyword_type,
        seq(
          $.keyword_all,
          choice(
            $.keyword_tables,
            $.keyword_sequences,
            $.keyword_functions,
            $.keyword_procedures,
            $.keyword_routines,
          ),
          $.keyword_in,
          $.keyword_schema,
        ),
      ),
    ),
    comma_list($._privilege_object, true),
  ),

  _privilege_object: $ => choice(
    prec.right(seq(
      $.object_reference,
      optional($.function_arguments),
    )),
    // MySQL `*.*` and `db.*`
    seq('*', '.', '*'),
    $.all_fields,
  ),

  grantee: $ => choice(
    seq(
      optional($.keyword_group),
      $.identifier,
    ),
    $.keyword_public,
    $.keyword_current_user,
    // MySQL 'user'@'host'
    seq(
      alias($._literal_string, $.literal),
      optional(
        seq(
          '@',
          alias($._literal_string, $.literal),
        ),
      ),
    ),
  ),

};
