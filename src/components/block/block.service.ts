// block.service.ts

import httpStatus from 'http-status';
import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import { BlockModel } from '@components/block/block.model';
import { IBlock } from '@components/block/block.interface';

const create = async (blockData: IBlock): Promise<boolean> => {
  try {
    const newBlock = await BlockModel.create(blockData);
    logger.debug(`Block created: %O`, newBlock);
    return true;
  } catch (err) {
    logger.error(`Block create err: %O`, err.message);
    throw new AppError(httpStatus.BAD_REQUEST, 'Block was not created!');
  }
};

const read = async (blockNumber: number): Promise<IBlock> => {
  logger.debug(`Sent block.number ${blockNumber}`);
  const block = await BlockModel.findOne({ number: blockNumber });
  return block as IBlock;
};

const readByHash = async (blockHash: string): Promise<IBlock> => {
  logger.debug(`Sent block.hash ${blockHash}`);
  const block = await BlockModel.findOne({ hash: blockHash });
  return block as IBlock;
};
const getLatestList = async (): Promise<IBlock[]> => {
  const blocks: IBlock[] = await BlockModel.aggregate([
    { $sort: { timestamp: -1 } },
    { $limit: 10 },
  ]);
  return blocks;
};

// Function to get the last synced block number
const getLastSyncedBlock = async (): Promise<number> => {
  // Find the highest block number in your database
  const lastBlock = await BlockModel.findOne().sort({ number: -1 });
  return lastBlock ? lastBlock.number : 0; // Return '0' if no blocks are saved
};

// Function to set the last synced block number
const setLastSyncedBlock = async (blockNumber: number): Promise<void> => {
  // You might implement this as part of the saveBlock function,
  // or as a separate function if you're storing this elsewhere.
};

const readBlockByPage = async (page: number): Promise<IBlock[]> => {
  try {
    const pageSize = 10;
    const skipCount = (page - 1) * pageSize;
    const pageBlock = await BlockModel.find()
      .sort({ timestamp: -1 })
      .skip(skipCount)
      .limit(pageSize);

    return pageBlock;
  } catch (error) {
    console.error('Error while reading the blocks:', error);
    throw error;
  }
};

const readBlockListWithSkip = async (skipNum: number): Promise<IBlock[]> => {
  try {
    const pageSize = 9;
    const skipCount = skipNum;
    const pageBlock = await BlockModel.find()
      .sort({ timestamp: -1 })
      .skip(skipCount)
      .limit(pageSize);

    return pageBlock;
  } catch (error) {
    console.error('Error while reading the blocks:', error);
    throw error;
  }
};

const getBlockTime = async (): Promise<number> => {
  try {
    // Get the latest block number
    const latestBlockNumber = await getLastSyncedBlock();

    // Get the timestamp of the latest block
    const latestBlock = await read(latestBlockNumber);
    const latestBlockTimestamp = latestBlock.timestamp;

    // Get the block number of a previous block, e.g., 100 blocks ago
    const previousBlockNumber = latestBlockNumber - 1;

    // Get the timestamp of the previous block
    const previousBlock = await read(previousBlockNumber);
    const previousBlockTimestamp = previousBlock.timestamp;

    // Calculate the block time (block interval) in seconds
    const timestampLatest = new Date(latestBlockTimestamp).getTime() / 1000;
    const timestampPrev = new Date(previousBlockTimestamp).getTime() / 1000;
    const blockTime = timestampLatest - timestampPrev;

    return blockTime;
  } catch (error) {
    return 0;
  }
};

export {
  create,
  read,
  readByHash,
  getLatestList,
  getLastSyncedBlock,
  setLastSyncedBlock,
  readBlockByPage,
  readBlockListWithSkip,
  getBlockTime,
};
