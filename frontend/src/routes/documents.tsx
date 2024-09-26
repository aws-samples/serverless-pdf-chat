import React, {useState} from "react";
import DocumentUploader from "../components/DocumentUploader";
import DocumentList from "../components/DocumentList";

const Documents: React.FC = () => {
  const [documentListKey, setDocumentListKey] = useState(1);
  const reloadDocuments = () => {
    setTimeout(() =>setDocumentListKey(Math.random()), 1000);
  }


  return (
    <>
      <DocumentUploader onDocumentUploaded={reloadDocuments}/>
      <DocumentList key={documentListKey}/>
    </>
  );
};

export default Documents;
