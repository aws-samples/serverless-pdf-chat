import React from "react";
import DocumentUploader from "../components/DocumentUploader";
import DocumentList from "../components/DocumentList";

const Documents: React.FC = () => {
  return (
    <>
      <DocumentUploader />
      <DocumentList />
    </>
  );
};

export default Documents;
