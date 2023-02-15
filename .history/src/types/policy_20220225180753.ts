/*
 * @Author: 21克的爱情
 * @Date: 2022-02-25 17:36:00
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2022-02-25 18:07:53
 * @Description: 
 */
class Policy {
  host: string;
  accessKeyId: string;
  policy: string;
  signature: string;
  dir: string;
  path: string;

  constructor(host: string, accessKeyId: string, policy: string, signature: string, dir: string, path: string) {
    this.host = host;
    this.accessKeyId = accessKeyId;
    this.policy = policy;
    this.signature = signature;
    this.dir = dir;
    this.path = path;
  }
}