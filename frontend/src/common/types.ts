export interface Document {
  documentid: string;
  userid: string;
  filename: string;
  filesize: string;
  docstatus: string;
  created: string;
  pages: string;
  conversations: {
    conversationid: string;
    created: string;
  }[];
}

export interface Conversation {
  conversationid: string;
  document: Document;
  messages: {
    type: string;
    data: {
      content: string;
      example: boolean;
      additional_kwargs: {};
    };
  }[];
}
