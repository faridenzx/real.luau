local Function = function(...) return ... end
if not LPH_OBFUSCATED then
    if LPH_JIT_ULTRA then LPH_JIT_ULTRA = Function end 
end
local Krypt = setmetatable({},{
    __index = function (self,key)
        return rawget(self,key)
    end,
    __newindex = function (self, key, value)
        if type(value) == "function" then
            return rawset(self,key,LPH_JIT_ULTRA(value))
        end
        return rawset(self,key,value)
    end
})
Krypt.Api = {
    Name = "nil"
}
local FILE = Krypt.Api.Name.."/NotSameServers.json"
function Krypt:Save()
    pcall(function()
        if makefolder and not isfolder(Krypt.Api.Name) then
            makefolder(Krypt.Api.Name)
        end
        writefile(FILE, game:GetService("HttpService"):JSONEncode(visited))
    end)
end

function Krypt:HopServer(maxPlayers : number)
    maxPlayers = maxPlayers or 3
    local placeId = game.PlaceId
    local hour = os.date("!*t").hour

    local visited = { hour = hour, ids = {} }
    pcall(function()
        local data = game:GetService("HttpService"):JSONDecode(readfile(FILE))
        if type(data) == "table" and data.hour == hour and type(data.ids) == "table" then
            visited = data
        end
    end)

    visited.ids[game.JobId] = true
    self:Save()

    local cursor = ""
    while true do
        local url = "https://games.roblox.com/v1/games/" .. placeId .. "/servers/Public?sortOrder=Asc&limit=100"
        if cursor ~= "" then
            url = url .. "&cursor=" .. cursor
        end

        local ok, res = pcall(function()
            return game:GetService("HttpService"):JSONDecode(game:HttpGet(url))
        end)

        if ok and type(res) == "table" and res.data then
            for _, server in ipairs(res.data) do
                local id = tostring(server.id)
                if tonumber(server.maxPlayers) > tonumber(server.playing)
                    and tonumber(server.playing) <= maxPlayers
                    and not visited.ids[id] then

                    visited.ids[id] = true
                    self:Save()

                    pcall(function()
                        game:GetService("ReplicatedStorage").__ServerBrowser:InvokeServer("teleport", id)
                    end)
                    task.wait(4)
                end
            end

            if res.nextPageCursor and res.nextPageCursor ~= "null" then
                cursor = res.nextPageCursor
            else
                cursor = ""
                task.wait(2)
            end
        else
            task.wait(2)
        end

        task.wait()
    end
end
return Krypt
