import { Document } from "../common/types";
import { getDateTime } from "../common/utilities";
import { filesize } from "filesize";
import {
  DocumentIcon,
  CircleStackIcon,
  ClockIcon,
  CheckCircleIcon,
  CloudIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const DocumentDetail: React.FC<Document> = (document: Document) => {
  return (
    <>
      <h3 className="text-center mb-3 text-lg font-bold tracking-tight text-gray-900">
        {document.filename}
      </h3>
      <div className="flex flex-col space-y-2">
        <div className="inline-flex items-center">
          <DocumentIcon className="w-4 h-4 mr-2" />
          {document.pages} pages
        </div>
        <div className="inline-flex items-center">
          <CircleStackIcon className="w-4 h-4 mr-2" />
          {filesize(Number(document.filesize)).toString()}
        </div>
        <div className="inline-flex items-center">
          <ClockIcon className="w-4 h-4 mr-2" />
          {getDateTime(document.created)}
        </div>
        {document.docstatus === "UPLOADED" && (
          <div className="flex flex-row justify-center pt-4">
            <span className="inline-flex items-center self-start bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
              <CloudIcon className="w-4 h-4 mr-1" />
              Awaiting processing
            </span>
          </div>
        )}
        {document.docstatus === "PROCESSING" && (
          <div className="flex flex-row justify-center pt-4">
            <span className="inline-flex items-center self-start bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
              <CogIcon className="w-4 h-4 mr-1 animate-spin" />
              Processing document
            </span>
          </div>
        )}
        {document.docstatus === "READY" && (
          <div className="flex flex-row justify-center pt-4">
            <span className="inline-flex items-center self-start bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Ready to chat
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentDetail;
