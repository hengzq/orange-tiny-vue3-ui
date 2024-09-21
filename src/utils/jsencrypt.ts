import JSEncrypt from 'jsencrypt/bin/jsencrypt';

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDqiE8lk2zlWqF/iWXuqt203JjXJ3x8I/wMza3WEfsAp6OnrHQhqiVi74k5Xt8MJfUzrMgYpg8u4EKYfpd/r0BEE+l3JstcfSXs+t2R9jvexA0uyGd/+YPY6vNSahQg3f2jCYhZ9vp7BxF0XSZCI+OfSlW1CPfnyUUyp9SiNyJTpwIDAQAB'

// 加密
export function encrypt(txt: string) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}
