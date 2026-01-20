import { createMMKV } from "react-native-mmkv";

const mmkvStorage =  createMMKV();

export default mmkvStorage;

// key-values stored in the MMKVStorage:
// 1. didUserOnboard: boolean