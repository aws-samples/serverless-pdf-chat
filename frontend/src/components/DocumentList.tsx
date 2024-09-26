import { useState, useEffect } from "react";
import { get } from "aws-amplify/api";
import { Link } from "react-router-dom";
import DocumentDetail from "./DocumentDetail";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";
import { Document } from "../common/types";
import Loading from "../../public/loading-grid.svg";

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [listStatus, setListStatus] = useState<string>("idle");

  const fetchData = async () => {
    setListStatus("loading");
    const response = await get({
      apiName: "serverless-pdf-chat", path:"doc"
    }).response;
    const docs = await response.body.json() as unknown as Document[]
    setListStatus("idle");
    setDocuments(docs);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between pt-6 pb-4">
        <h2 className="text-2xl font-bold">My documents</h2>
        <button
          onClick={fetchData}
          type="button"
          className="text-gray-700 border border-gray-700 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2 text-center inline-flex items-center"
        >
          <ArrowPathRoundedSquareIcon
            className={`w-5 h-5 ${
              listStatus === "loading" ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {documents &&
          documents.length > 0 &&
          documents.map((document: Document) => (
            <Link
              to={`/doc/${document.documentid}/${document.conversations[0].conversationid}/`}
              key={document.documentid}
              className="block p-6 bg-white border border-gray-200 rounded hover:bg-gray-100"
            >
              <DocumentDetail document={document} onDocumentDeleted={fetchData}/>
            </Link>
          ))}
      </div>
      {listStatus === "idle" && documents.length === 0 && (
        <div className="flex flex-col items-center mt-4">
          <p className="font-bold text-lg">There's nothing here yet...</p>
          <p className="mt-1">Upload your first document to get started!</p>
        </div>
      )}
      {listStatus === "loading" && documents.length === 0 && (
        <div className="flex flex-col items-center mt-4">
          <img src={Loading} width={40} />
        </div>
      )}
    </div>
  );
};

export default DocumentList;
