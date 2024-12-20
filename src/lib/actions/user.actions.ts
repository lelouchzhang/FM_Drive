'use server';
import { ID, Query } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '../appwrite';
import { cookies } from 'next/headers';
import { appwriteConfig } from '../appwrite/config';
import { parseStringify, handleError } from '../utils';
import { avatarPlaceholderUrl, LOGIN_COOKIE_NAME } from '@/constants';
import { redirect } from 'next/navigation';

// 辅助函数: getUserByEmail => 用户信息|null
/**
 * 查询users表满足[Query.equal('email', [email])]的结果，返回
 * @returns 用户信息|null
 */
async function getUserByEmail(email: string) {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    // databaseId
    appwriteConfig.databaseId,
    // collectionId
    appwriteConfig.usersCollectionId,
    // query
    [Query.equal('email', [email])]
  );
  return result.total > 0 ? result.documents[0] : null;
}

// 辅助函数: sendEmailOtp
/**
 * 请求appwrite 发送emailOtp至传入的邮箱
 * 注意返回的是数据库中用户的accountId
 */
export async function sendEmailOtp({ email }: { email: string }): Promise<string | undefined> {
  const { account } = await createAdminClient();
  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    handleError(error, '发送验证码失败,请检查邮箱是否正确,或稍后再试');
  }
}

// 服务器操作: createAccount
/**
 * 对于已注册用户,accountId来源于email对应的用户的accountId
 * 对于新用户，accountId在sendEmailOtp时创建
 */
export const createAccount = async ({ fullName, email }: { fullName: string; email: string }) => {
  const isUserExisting = await getUserByEmail(email);

  const accountId: string | undefined = await sendEmailOtp({ email });
  if (!accountId) throw new Error('发送验证码失败');

  if (!isUserExisting) {
    const { databases } = await createAdminClient();
    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        accountId,
        avatarUrl: avatarPlaceholderUrl,
      }
    );
  }
  return parseStringify({ accountId });
};

// 服务器操作： OTP验证
export const verifyOTP = async ({ accountId, otp }: { accountId: string; otp: string }) => {
  const { account } = await createAdminClient();
  try {
    const session = await account.createSession(accountId, otp);
    (await cookies()).set(LOGIN_COOKIE_NAME, session.secret, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, '输入的验证码错误');
  }
};

// 服务器操作: 获取当前用户
export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();

    const result = await account.get();
    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal('accountId', result.$id)]
    );

    if (user.total <= 0) return null;
    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
  }
};

// 服务器操作: 退出登录
export const signOutUser = async () => {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession('current');
    (await cookies()).delete(LOGIN_COOKIE_NAME);
  } catch (error) {
    handleError(error, '退出登录失败');
  } finally {
    redirect('/sign-in');
  }
};

// 服务器操作: 登录
export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      await sendEmailOtp({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }
    return parseStringify({ accountId: null, error: '用户不存在' });
  } catch (error) {
    handleError(error, '登录失败');
  }
};
