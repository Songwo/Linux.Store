local stockKey = KEYS[1]
local buyersKey = KEYS[2]
local reqKey = KEYS[3]
local userId = ARGV[1]
local reqTTL = tonumber(ARGV[2])

if redis.call('EXISTS', reqKey) == 1 then
  return 3
end
redis.call('SETEX', reqKey, reqTTL, '1')

if redis.call('SISMEMBER', buyersKey, userId) == 1 then
  return 2
end

local stock = tonumber(redis.call('GET', stockKey) or '-1')
if stock <= 0 then
  return 1
end

redis.call('DECR', stockKey)
redis.call('SADD', buyersKey, userId)
return 0
