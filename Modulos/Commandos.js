module.exports = {
    Run: async function(Context, Command, Args)
    {
        if (Command.toLowerCase() === ".mesa")
        {
            if (Args.length == 0)
            {
                Context.reply("use: .mesa {criar/deletar/renomear}");
                return;
            }

            if (Args[0].toLowerCase() === "criar")
            {
                if (Args.length == 1)
                {
                    Context.reply("use: .mesa criar {nome}");
                    return;
                }

                var Msg = await Context.reply("Mesa Sendo Criada...");
                var Name = Args.slice(1, Args.length).toString();
                CriarMesa(Context, Name, Msg);
            }

            if (Args[0].toLowerCase() === "deletar")
            {
                if (Args.length == 1)
                {
                    Context.reply("use: .mesa deletar {id}");
                    return;
                }
                
                var Msg = await Context.reply("Mesa Sendo Deletada...");
                DeletarMesa(Context, Args[1], Msg);
            }

            if (Args[0].toLowerCase() === "renomear")
            {
                if (Args.length == 1)
                {
                    Context.reply("use: .mesa renomear {nome}");
                    return;
                }

                var Msg = await Context.reply("Mesa Sendo Renomeada...");
                var Name = Args.slice(1, Args.length).toString();
                RenameChatMesa(Context, Name, Msg);
            }
        }
        else if (Command.toLowerCase() === ".clear")
        {
            ClearChannel(Context, Arg[0]);
        }
    }
}

async function CriarMesa(Context, Name, Msg)
{
    var Utility = require("./Utility.js");

    Name = Name.toString().toLowerCase().replace(",", "_").replace(" ", "_");
    Name += `_(${Context.author.username})`;

    var Role = await Utility.createRole(Context, Name, 'GREY');
    var Category = await Utility.createCategory(Context, `.${Name}`, [{ id: Context.guild.id, deny: ['VIEW_CHANNEL']}, { id: Role.id, allow: ['VIEW_CHANNEL']}]);
    await Utility.createChannel(Context, 'chat', 'GUILD_TEXT', Category);
    await Utility.createChannel(Context, 'dado', 'GUILD_TEXT', Category);
    await Utility.createChannel(Context, 'links', 'GUILD_TEXT', Category);
    await Utility.createChannel(Context, 'Voz', 'GUILD_VOICE', Category);
    await Context.member.roles.add(Role);

    await Context.delete();
    await Msg.edit(`Mesa Criada...! By:<@${Context.author.id}>`);
}

async function DeletarMesa(Context, Id, Msg)
{
    if (isNaN(Args[1])) return await Msg.edit("use: .mesa deletar {id} // Coloque o Id da Mesa Valido.");

    var Cat = Context.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY" && x.deleted === false );
    Cat = Cat.filter(x => x.id === Id);

    try{
        var Category = Cat.values().next().value;
        if (Category.name[0] != '.')
            return Msg.delete();

        var IdRole = 1;
        for (let perm of Category.permissionOverwrites.cache) {
            IdRole = perm[0];
        }

        var Roles = Context.guild.roles.cache.filter(x => x.id === IdRole);
        var Role = Roles.values().next().value;

        if (Context.member.roles.cache.find(x => x.id == Role.id) === undefined)
            return Msg.delete();

        var Chs = Category.children;
        for (let Ch of Chs) {
            await Ch[1].delete();
        }

        await Role.delete();
        await Category.delete();
        await Context.delete();
        await Msg.edit(`Mesa Deletada...! By:<@${Context.author.id}>`);
    }
    catch { Msg.delete() }
}

async function RenameChatMesa(Context, Name, Msg)
{
    try{
        var Cat = Context.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY" && x.id === Context.channel.parentId && x.deleted === false );
        var Category = Cat.values().next().value;

        if (Category.name[0] != '.')
            return Msg.delete();

        Name = Name.toLowerCase().toString();
        
        Context.channel.setName(Name).then(async () => {
            await Context.delete();
            await Msg.edit(`Chat Renomada...! By:<@${Context.author.id}>`);
        }).catch(() => {
            Msg.delete();
        })
    }
    catch { Msg.delete() }
}

async function ClearChannel(Context, Index)
{
    if(!Context.guild.me.permissions.has("MANAGE_MESSAGES")) {
        Context.reply(`${Context.guild.me.Name} não tem permissão \`\`MANAGE_MESSAGES\`\``);
        return;
    }

    if (!Index) return Context.reply("Coloque um numero de menssagens para limpar.");
    if (isNaN(Index)) return Context.reply("Coloque um numero verdadeira.");

    if (Index > 100) return Context.reply("Valor tem que ser menor que 100.");
    if (Index < 1) return Context.reply("Valor tem que ser maior que 1.");

    await Context.channel.messages.fetch({limit: Index}).then(msgs => {
        Context.channel.bulkDelete(msgs);
    })
}

