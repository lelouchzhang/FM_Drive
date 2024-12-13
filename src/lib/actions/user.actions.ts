'use server';
import { ID, Query } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '../appwrite';
import { cookies } from 'next/headers';
import { appwriteConfig } from '../appwrite/config';
import { parseStringify, handleError } from '../utils';
import { avatarPlaceholderUrl, LOGIN_COOKIE_NAME } from '@/constants';
import { redirect } from 'next/navigation';
/**
 * 登录流程
 * 1. 用户输入邮箱和密码
 * 2. 检查邮箱是否存在
 * 3. 发送otp
 * 4. 创建session
 * 5. 创建用户信息(如果用户不存在)
 * 6. 返回用户id用于登录
 * 7. 验证otp,登录
 */

// 辅助函数: getUserByEmail

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
// 当查询失败时,返回undefined,等待创建新用户
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

export const createAccount = async ({ fullName, email }: { fullName: string; email: string }) => {
  // 尝试通过email查找用户
  const isUserExisting = await getUserByEmail(email);

  // 发送otp,并返回accountID
  const accountId: string | undefined = await sendEmailOtp({ email });
  if (!accountId) throw new Error('发送验证码失败');

  if (!isUserExisting) {
    // 创建新用户
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
    //todo 如果没有session或其他错误，返回null
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
