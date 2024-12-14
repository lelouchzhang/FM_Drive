import { cn, getFileIcon } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';
interface Props {
  type: string;
  extension: string;
  url: string;
  className?: string;
  imageClassName?: string;
}

const Thumbnail = ({ type, extension, url = '', className, imageClassName }: Props) => {
  const showImage = type === 'image' && extension !== 'svg';
  return (
    <figure className={cn('thumbnail', className)}>
      <Image
        src={showImage ? url : getFileIcon(extension, type)}
        alt="thumbnail"
        width={100}
        height={100}
        unoptimized={!showImage}
        className={cn('size-8 object-contain', imageClassName, showImage && 'thumbnail-image')}
        loading="lazy"
      />
    </figure>
  );
};

export default Thumbnail;
