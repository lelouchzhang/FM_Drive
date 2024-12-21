import Card from '@/components/Card';
import Sort from '@/components/Sort';
import { getFiles } from '@/lib/actions/file.action';
import { convertFileSize, getFileTypesParams } from '@/lib/utils';
import { Models } from 'node-appwrite';
import React, { useEffect, useState } from 'react';

const page = async ({ searchParams, params }: SearchParamProps) => {
  // console.log('params:', await params); // type:type
  const type = ((await params)?.type as string) || '';
  // Search
  const searchText = ((await searchParams)?.query as string) || '';
  const sort = ((await searchParams)?.sort as string) || '';

  // 用于分类获取文件
  const types = getFileTypesParams(type) as FileType[];

  const files = await getFiles({ types, searchText, sort });

  // 1. 计算总文件大小（字节数）
  const totalSizeInBytes = files.documents.reduce(
    (sum: any, file: any) => sum + (file.size || 0),
    0
  );

  // 2. 转换为可读大小
  const readableTotalSize = convertFileSize(totalSizeInBytes);

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">{readableTotalSize}</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>

            <Sort />
          </div>
        </div>
      </section>
      {/* Render the files */}
      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: Models.Document) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">这里什么都没有...</p>
      )}
    </div>
  );
};

export default page;
