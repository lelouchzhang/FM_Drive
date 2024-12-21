'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

import { cn, convertFileToUrl, getFileType } from '@/lib/utils';
import Thumbnail from './Thumbnail';
import { MAX_FILE_SIZE } from '@/constants';
import { uploadFile } from '@/lib/actions/file.action';
import { usePathname } from 'next/navigation';

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

const FileUploader = ({ ownerId, accountId, className }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const path = usePathname();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Do something with the files
      setFiles(acceptedFiles);
      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));

          return toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> 文件大小超过限制 （50MB）
              </p>
            ),
            className: 'error-toast',
          });
        }
        return uploadFile({ file, ownerId, accountId, path }).then((uploadedFile) => {
          if (uploadedFile) {
            setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
          }
        });
      });
      await Promise.all(uploadPromises);
    },
    [ownerId, accountId, path]
  );

  const handleRemoveFile = (e: React.MouseEvent<HTMLImageElement>, fileName: string) => {
    e.stopPropagation();
    //todo prevFiles是函数式更新的方式，相当于最近的files
    //todo 确保你总是在操作最新的状态值，避免潜在的竞态条件。
    //todo 使用函数式更新更安全，因为 React 保证 prevFiles 一定是最新的状态值。
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      <Button type="button" className={cn('uploader-button', className)}>
        <Image src="/assets/icons/upload.svg" alt="upload" width={24} height={24} />
        <p>上传文件</p>
      </Button>
      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">上传中</h4>

          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li className="uploader-preview-item" key={`${file.name}-${index}`}>
                <div className="flex items-center gap-3">
                  <Thumbnail type={type} extension={extension} url={convertFileToUrl(file)} />
                </div>
                <div className="preview-item-name">
                  {file.name}
                  <Image src="/assets/icons/file-loader.gif" width={144} height={8} alt="Loader" />
                </div>
                <Image
                  src="/assets/icons/remove.svg"
                  width={24}
                  height={24}
                  alt="Remove"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
