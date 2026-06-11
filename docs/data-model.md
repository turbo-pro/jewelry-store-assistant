# 数据模型草案

当前小程序 MVP 使用本地缓存。后续接微信云开发时，可以按以下集合迁移。

## store

- id
- name
- ownerOpenId
- createdAt

## monthly_target

- id
- storeId
- year
- month
- totalTargetWan
- weekendRatio
- holidayRatio
- specialDays: number[]
- createdAt
- updatedAt

## daily_record

- id
- storeId
- date
- salesWan
- goldGram
- orderCount
- pieceCount
- note
- createdAt
- updatedAt

## staff_record 后续

- id
- storeId
- staffId
- date
- salesWan
- goldGram
- orderCount
- pieceCount
