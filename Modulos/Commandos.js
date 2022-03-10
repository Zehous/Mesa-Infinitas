module.exports = {
    Run: async function(Context, Command, Args)
    {
        if (Command.toLowerCase() === ".mesa")
        {
            if (Args.length == 0)
            {
                if (CheckIsValidMesa(Context))
                    Context.reply("use: .mesa {criar/deletar/chats/usuarios}");
                else Context.reply("use: .mesa {criar/usuarios}");
                return;
            }

            if (Args[0].toLowerCase() === "criar" || Args[0].toLowerCase() === "create")
            {
                if (Args.length == 1)
                {
                    Context.reply("use: .mesa criar {nome}");
                    return;
                }

                var Msg = await Context.channel.send("Mesa Sendo Criada...");
                var Name = Args.slice(1, Args.length).toString();
                CriarMesa(Context, Name, Msg);
            }

            if ((Args[0].toLowerCase() === "deletar" || Args[0].toLowerCase() === "del") && CheckIsValidMesa(Context))
            {
                var Cat = Context.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY" && x.id === Context.channel.parentId && x.deleted === false );
                var Category = Cat.values().next().value;

                if (Category.name[0] != '.')
                    return Context.reply("Essa categoria não e uma mesa valida...");

                CheckMark(Context, DeletarMesa);
            }

            if (Args[0].toLowerCase() === "users" || Args[0].toLowerCase() === "usuarios")
            {
                if (Args.length <= 3)
                {
                    Context.reply("use: .mesa usuarios {adicionar/remover} {@ do usuario} {Mesa Categoria Id}");
                    return;
                }

                if (Args[1].toLowerCase() === "adicionar" || Args[1].toLowerCase() === "add")
                {
                    UserAdd(Context, Args[3])
                }

                if (Args[1].toLowerCase() === "remover" || Args[1].toLowerCase() === "remove")
                {
                    UserRem(Context, Args[3])
                }
            }

            if (Args[0].toLowerCase() === "chats" && CheckIsValidMesa(Context))
            {
                if (Args.length == 1)
                {
                    Context.reply("use: .mesa chat {criar/deletar/renomear}");
                    return;
                }

                if (Args[1].toLowerCase() === "criar")
                {
                    if (Args.length == 2)
                    {
                        Context.reply("use: .mesa criar {nome}");
                        return;
                    }

                    var Msg = await Context.reply("Chat da Mesa Sendo Criada...");
                    var Name = Args.slice(2, Args.length);
                    CriaChatMesa(Context, Name, Msg);
                }

                if (Args[1].toLowerCase() === "deletar" || Args[1].toLowerCase() === "del")
                {
                    var Cat = Context.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY" && x.id === Context.channel.parentId && x.deleted === false );
                    var Category = Cat.values().next().value;

                    if (Category.name[0] != '.')
                        return Context.reply("Essa categoria não e uma mesa valida...");

                    CheckMark(Context, DelChatMesa);
                }

                if (Args[1].toLowerCase() === "renomear" || Args[1].toLowerCase() === "rename")
                {
                    if (Args.length == 2)
                    {
                        Context.reply("use: .mesa chat renomear {nome}");
                        return;
                    }

                    var Msg = await Context.reply("Chat da Mesa Sendo Renomeada...");
                    var Name = Args.slice(2, Args.length).toString();
                    RenameChatMesa(Context, Name, Msg);
                }
            }
        }
        else if (Command.toLowerCase() === ".clear")
        {
            ClearChannel(Context, Args[0]);
        }
    }
}

async function CriarMesa(Context, Name, Msg)
{
    var Utility = require("./Utility.js");

    Name = Name.toString().toLowerCase().replace(",", "_").replace(" ", "_");
    Name += `_(${Context.author.username})`;

    var Role = await Utility.createRole(Context, Name, 'GREY');
    var SpecRole = Context.guild.roles.cache.find(x => x.name.toLowerCase().includes('spec'));

    var CatConfig = [{}];
    var Config = [{}];

    if (SpecRole != undefined)
    {
        CatConfig = [
            { id: Context.guild.id, deny: ['VIEW_CHANNEL']}, 
            { id: Role.id, allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'CONNECT', 'SPEAK', 'ATTACH_FILES', 'EMBED_LINKS', 'ADD_REACTIONS']},
            { id: SpecRole.id, allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'CONNECT']},
        ]

        Config = [
            { id: Context.guild.id, deny: ['VIEW_CHANNEL']}, 
            { id: Role.id, allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'CONNECT', 'SPEAK', 'ATTACH_FILES', 'EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_CHANNELS']},
            { id: SpecRole.id, allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'CONNECT']},
        ]
    }
    else{
        CatConfig = [
            { id: Context.guild.id, deny: ['VIEW_CHANNEL']}, 
            { id: Role.id, allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'CONNECT', 'SPEAK', 'ATTACH_FILES', 'EMBED_LINKS', 'ADD_REACTIONS']},
        ]

        Config = [
            { id: Context.guild.id, deny: ['VIEW_CHANNEL']}, 
            { id: Role.id, allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'CONNECT', 'SPEAK', 'ATTACH_FILES', 'EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_CHANNELS']},
        ]
    }

    var Category = await Utility.createCategory(Context, `.${Name}`, CatConfig);
    await Utility.createChannel(Context, 'chat', 'GUILD_TEXT', Category);
    await Utility.createChannel(Context, 'dado', 'GUILD_TEXT', Category);
    await Utility.createChannel(Context, 'links', 'GUILD_TEXT', Category);
    await Utility.createChannel(Context, 'musicas', 'GUILD_TEXT', Category);
    await Utility.createChannel(Context, 'Voz #1', 'GUILD_VOICE', Category);
    await Utility.createChannel(Context, 'Voz #2', 'GUILD_VOICE', Category);
    await Context.member.roles.add(Role);

    await Context.delete();
    await Msg.edit(`Mesa Criada...! By:<@${Context.author.id}>`);
}

async function DeletarMesa(Context, Msg)
{
    try{
        var Cat = Context.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY" && x.id === Context.channel.parentId && x.deleted === false );
        var Category = Cat.values().next().value;

        if (Category.name[0] != '.')
            return Msg.edit("Categoria não pode ser deletada...");

        var Role = GetRoleByCategory(Context, Category);

        if (Role === undefined)
            return;

        if (Context.member.roles.cache.find(x => x.id == Role.id) === undefined)
            return Msg.edit("Não foi possivel achar o cargo no usuario...");

        var Chs = Category.children;
        for (let Ch of Chs) {
            await Ch[1].delete();
        }

        await Role.delete();
        await Category.delete();
        
    }
    catch { Msg.delete() }
}

async function RenameChatMesa(Context, Name, Msg)
{
    try{
        var Cat = Context.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY" && x.id === Context.channel.parentId && x.deleted === false );
        var Category = Cat.values().next().value;

        if (Category.name[0] != '.')
            return Msg.edit("o chat não pode ser remomeado nessa categoria...");

        Name = Name.toString().toLowerCase();
        Name = Name.replaceAll(" ", "_");
        Name = Name.replaceAll(",", "_");
        
        Context.channel.setName(Name).then(async () => {
            await Context.delete();
            await Msg.edit(`Chat Renomada...! By:<@${Context.author.id}>`);
        }).catch(() => {
            Msg.delete();
        })
    }
    catch { Msg.delete() }
}

async function CriaChatMesa(Context, Name, Msg)
{
    try{
        var Utility = require("./Utility.js");

        Name = Name.toString().toLowerCase();
        Name = Name.replaceAll(" ", "_");
        Name = Name.replaceAll(",", "_");

        var Cat = Context.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY" && x.id === Context.channel.parentId && x.deleted === false );
        var Category = Cat.values().next().value;

        if (Category.name[0] != '.')
            return Msg.edit("o chat não pode ser criado nessa categoria...");

        await Utility.createChannel(Context, Name, 'GUILD_TEXT', Category);

        await Context.delete();
        await Msg.edit(`Chat Criado...! By:<@${Context.author.id}>`);
    }
    catch { Msg.delete() }
}

async function DelChatMesa(Context, Msg)
{
    try{
        var Cat = Context.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY" && x.id === Context.channel.parentId && x.deleted === false );
        var Category = Cat.values().next().value;

        if (Category.name[0] != '.')
            return Msg.edit("o chat não pode ser deletado nessa categoria...");


        if (Category.children.size >= 2)
        {
            await Context.channel.delete();
        }
        else {
            await Msg.edit(`Para Deletar um Chat Precisa de pelo menos um outro chat! By:<@${Context.author.id}>`);
        }
    }
    catch { Msg.delete() }
}

async function ClearChannel(Context, Index)
{
    if(!Context.member.permissions.has("MANAGE_MESSAGES")) {
        Context.reply(`<@${Context.author.id}> não tem permissão \`\`MANAGE_MESSAGES\`\``);
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

async function UserAdd(Context, MesaId)
{
    var Cat = Context.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY" && x.id === MesaId && x.deleted === false );
    var Category = Cat.values().next().value;

    if (Category === undefined) return Context.reply("error: categoria não achada...");

    var Role = GetRoleByCategory(Context, Category);
    var Ment = Context.mentions.members.first();

    if (Role === undefined)
        return;

    if (Ment.roles.cache.find(x => x.id == Role.id))
        return Context.reply("A Pessoa Mencionada Já Possui o cargo.");

    if (!Context.member.roles.cache.find(x => x.id == Role.id))
        return Context.reply("Você não pode dar um cargo de outras pessoas sem ter o cargo.");

    if ( Context.mentions.users.size >= 1)
    {
        Ment.roles.add(Role);
        Context.channel.send(`O Cargo <@&${Role.id}> foi dado para o <@${Ment.id}>. By: <@${Context.author.id}>`)
        Context.delete();
    }
    else {Context.reply("a pessoa mencionada não foi achada")}
}

async function UserRem(Context, MesaId)
{
    var Cat = Context.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY" && x.id === MesaId && x.deleted === false );
    var Category = Cat.values().next().value;

    if (Category === undefined) return Context.reply("error: categoria não achada...");

    var Role = GetRoleByCategory(Context, Category);
    var Ment = Context.mentions.members.first();
    
    if (Role === undefined)
        return;
        
    if (!Ment.roles.cache.find(x => x.id == Role.id))
        return Context.reply("A Pessoa Mencionada Não Possui o cargo.");

    if (!Context.member.roles.cache.find(x => x.id == Role.id))
        return Context.reply("Você não pode tirar o cargo de outras pessoas sem ter o cargo.");

    if ( Context.mentions.users.size >= 1)
    {
        Ment.roles.remove(Role);
        Context.channel.send(`O Cargo <@&${Role.id}> foi retirado do <@${Ment.id}>. By: <@${Context.author.id}>`)
        Context.delete();
    }
    else {Context.reply("a pessoa mencionada não foi achada")}
}





function CheckIsValidMesa(Context)
{
    var Cat = Context.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY" && x.id === Context.channel.parentId && x.deleted === false );
    var Category = Cat.values().next().value;

    if (Category === undefined || Category.name[0] != '.')
        return false;

    return true;
}

function GetRoleByCategory(Context, Category)
{
    try{
        var IdRole = 1;
        let Cont = 0;
        for (let perm of Category.permissionOverwrites.cache) {
            IdRole = perm[0];
            Cont++
            if(Cont >= Category.permissionOverwrites.cache.size-1)
                break;
        }

        var Roles = Context.guild.roles.cache.filter(x => x.id === IdRole);
        var Role = Roles.values().next().value;

        return Role;
    }
    catch {
        Context.reply("erro: \"Erro Inesperado na Coleta de Cargos\"");
        return undefined;
    }
}

async function CheckMark(Context, Function)
{
    var Msg = await Context.reply("Você tem certeza que deseja fazer essa ação?... **Use a reação para confirmar ou espere 15s**");

    await Msg.react('✅');

    Msg.awaitReactions({ max: 2, time: 15000 })
        .then(async (collected) => {
            var React = collected.first();
            

            var Users = React.users._cache.filter(x => x.id === Context.author.id);

            var User = Users.values().next().value;

            if (User != undefined)
            {
                if (User.id == Context.author.id && React._emoji.name === '✅')
                {
                    await Msg.reactions.removeAll();
                    Function(Context, Msg);
                }
            }
        })
        .catch(collected => {
            Context.delete();
            Msg.delete();
        });
}