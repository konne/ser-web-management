export abstract class SearchTokens {

    /**
     * pattern to match meta informations from tokens
     * relevant matches: $1 => count; $2 => from date; $3 => to date
     */
    public static readonly NAMED_LICENSE_META = /^EXCEL_NAMED(.*?)$/;

    /**
     * pattern to match meta informations from tokens
     * relevant matches: $1 => count; $2 => from date; $3 => to date
     */
    public static readonly TOKEN_LICENSE_META = /^EXCEL_TOKENS(.*?)$/;

    /**
     * pattern to match username
     */
    public static readonly TOKEN_NAME = /^EXCEL_NAME(.*?)$/;
}
