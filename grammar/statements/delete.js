import { comma_list } from "../helpers.js";

export default {

  _delete_statement: $ => seq(
    $.delete,
    alias($._delete_from, $.from),
    optional($.returning),
  ),

  _delete_from: $ => seq(
    $.keyword_from,
    optional(
      $.keyword_only,
    ),
    $.object_reference,
    optional($._alias),
    optional(
      seq(
        $.keyword_using,
        comma_list($.relation, true),
      ),
    ),
    optional($.where),
    optional($.order_by),
    optional($.limit),
  ),

  delete: $ => seq(
    $.keyword_delete,
    optional($.index_hint),
  ),

};
