import { ChangeEvent, useState, useEffect } from "react";
import { get } from "aws-amplify/api";
import { filesize } from "filesize";
import {
  DocumentIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  XCircleIcon,
  ArrowLeftCircleIcon,
} from "@heroicons/react/24/outline";

interface DocumentUploaderProps {
  onDocumentUploaded?:() => void
}
const DocumentUploader: React.FC<DocumentUploaderProps> = ({onDocumentUploaded}) => {
  const [inputStatus, setInputStatus] = useState<string>("idle");
  const [buttonStatus, setButtonStatus] = useState<string>("ready");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setInputStatus("valid");
      } else {
        setSelectedFile(null);
      }
    }
  }, [selectedFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const uploadFile = async () => {
    if(selectedFile) {
      setButtonStatus("uploading");
      const response = await get({
        apiName: "serverless-pdf-chat",
        path: "generate_presigned_url",
        options: {
          headers: { "Content-Type": "application/json" },
          queryParams: {
            "file_name": selectedFile?.name
          }
        },
      }).response
      const presignedUrl = await response.body.json() as { presignedurl: string }
      fetch(presignedUrl?.presignedurl, {
        method: "PUT",
        body: selectedFile,
        headers: { "Content-Type": "application/pdf" },
      }).then(() => {
        setButtonStatus("success");
        if (onDocumentUploaded) onDocumentUploaded();
      });
    }
  };

  const resetInput = () => {
    setSelectedFile(null);
    setInputStatus("idle");
    setButtonStatus("ready");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold pb-4">Add document</h2>
      {inputStatus === "idle" && (
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <CloudArrowUpIcon className="w-12 h-12 mb-3 text-gray-400" />

              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> your
                document
              </p>
              <p className="text-xs text-gray-500">Only .pdf accepted</p>
            </div>

            <input
              onChange={handleFileChange}
              id="dropzone-file"
              type="file"
              className="hidden"
            />
          </label>
        </div>
      )}
      {inputStatus === "valid" && (
        <div className="flex items-center justify-center w-full">
          <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
            <>
              <div className="flex flex-row items-center mb-5">
                <DocumentIcon className="w-14 h-14 text-gray-400" />
                <div className="flex flex-col ml-2">
                  <p className="font-bold mb-1">{selectedFile?.name}</p>
                  <p>
                    {filesize(selectedFile ? selectedFile.size : 0).toString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-row items-center">
                {buttonStatus === "ready" && (
                  <button
                    onClick={resetInput}
                    type="button"
                    className="inline-flex items-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg px-3 py-2 text-sm mr-2 mb-2 "
                  >
                    <XCircleIcon className="w-5 h-5 mr-1.5" />
                    Cancel
                  </button>
                )}
                {buttonStatus === "uploading" && (
                  <button
                    disabled
                    onClick={resetInput}
                    type="button"
                    className="inline-flex items-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg px-3 py-2 text-sm mr-2 mb-2 "
                  >
                    <XCircleIcon className="w-5 h-5 mr-1.5" />
                    Cancel
                  </button>
                )}
                {buttonStatus === "success" && (
                  <button
                    onClick={resetInput}
                    type="button"
                    className="inline-flex items-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg px-3 py-2 text-sm mr-2 mb-2 "
                  >
                    <ArrowLeftCircleIcon className="w-5 h-5 mr-1.5" />
                    Upload another document
                  </button>
                )}
                {buttonStatus === "ready" && (
                  <button
                    onClick={uploadFile}
                    type="button"
                    className="inline-flex items-center bg-violet-900 text-white border border-gray-300 focus:outline-none hover:bg-violet-700 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg px-3 py-2 text-sm mr-2 mb-2 "
                  >
                    <CloudArrowUpIcon className="w-5 h-5 mr-1.5" />
                    Upload document
                  </button>
                )}
                {buttonStatus === "uploading" && (
                  <button
                    disabled
                    onClick={uploadFile}
                    type="button"
                    className="inline-flex items-center bg-violet-900 text-white border border-gray-300 focus:outline-none hover:bg-violet-700 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg px-3 py-2 text-sm mr-2 mb-2 "
                  >
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-4 mr-3 text-white animate-spin"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="#E5E7EB"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentColor"
                      />
                    </svg>
                    Uploading...
                  </button>
                )}
                {buttonStatus === "success" && (
                  <button
                    disabled
                    onClick={uploadFile}
                    type="button"
                    className="inline-flex items-center bg-violet-900 text-white border border-gray-300 focus:outline-none hover:bg-violet-700 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg px-3 py-2 text-sm mr-2 mb-2 "
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-1.5" />
                    Upload successful!
                  </button>
                )}
              </div>
            </>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
