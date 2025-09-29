export default interface Cdr {
  begin_time: string;
  duration?: number;
  rate?: { direction?: "inbound" | "outbound" };
  cost?: number | string;
  category?: string;
  additional_info?: {
    NumberType?: "MOBILE" | "FIXED_LINE";
    billing_category?: string;
  };
  cdr_attr?: { ["X-sipuser"]?: string };
}
