'use server';
// node-appwrite sdk

import { Account, Avatars, Client, Databases, Storage } from 'node-appwrite';
import { appwriteConfig } from './config';
import { cookies } from 'next/headers';
import { LOGIN_COOKIE_NAME } from '@/constants';

// 创建appwrite client

export const createSessionClient = async () => {
  // 声明client，用于初始化实例和服务（数据库）
  // 有两种方法创建client：admin client 和 session client，这里是session client
  // session client 使用户可以访问数据库，以及在权限内操作数据库
  // 之所以每次会话都创建client，是因为session client 是基于用户的，每个用户应有自己的session client避免泄露隐私

  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId);
  // 创建session
  const session = (await cookies()).get(LOGIN_COOKIE_NAME);

  if (!session || !session.value) {
    throw new Error('No session found');
  }

  // 设置session
  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      // 这个databases实例会被用户的session token限制
      return new Databases(client);
    },
  };
};

export const createAdminClient = async () => {
  // admin client 用于在数据库中执行管理操作，例如创建数据库、集合、用户等
  // 只在服务器端使用的方法,通过secretKey连接appwrite
  // 创建用户，管理数据库或更高级别的操作

  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.secretKey);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      // 这个databases实例拥有完整的管理权限
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
    get avatars() {
      return new Avatars(client);
    },
  };
};
