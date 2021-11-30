module.exports = {
    createCategory: async function(Context, name, Perms)
    {
        return await Context.guild.channels.create(`${name}`, {
            type: 'GUILD_CATEGORY',
            permissionOverwrites: Perms
        });
    },

    createChannel: async function(Context, Name, Type, Parent, Perms)
    {
        if (Perms == null)
        {
            return await Context.guild.channels.create(`${Name}`, {
                type: Type,
                parent: Parent,
            });
        }
        else{
            return await Context.guild.channels.create(`${Name}`, {
                type: Type,
                parent: Parent,
                permissionOverwrites: Perms
            });
        }
    },

    createRole: async function(Context, Name, Color)
    {
        return await Context.guild.roles.create({ name: Name, mentionable: true, Color: Color })
    }
}