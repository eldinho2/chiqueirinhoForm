import { NextResponse } from "next/server";
import prisma from "@/services/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { dungeon, eventId, players } = body;

        console.log("Recebendo dados:", { dungeon, eventId, players });

        if (!dungeon || !eventId || !Array.isArray(players) || players.length === 0) {
            console.error("Dados ausentes ou inválidos:", { dungeon, eventId, players });
            return NextResponse.json(
                { message: "Dados inválidos: 'dungeon', 'eventId' ou 'players' ausentes ou incorretos." },
                { status: 400 }
            );
        }

        const invalidPlayers = players.filter(
            player => !player.nick || typeof player.nick !== "string"
        );

        if (invalidPlayers.length > 0) {
            console.error("Jogadores inválidos detectados:", invalidPlayers);
            return NextResponse.json(
                { message: "Alguns jogadores possuem dados inválidos.", invalidPlayers },
                { status: 400 }
            );
        }

        const playerNicks = players.map(player => player.nick.toLowerCase());
        const existingPlayers = await prisma.users.findMany({
            where: { nickname: { in: playerNicks } },
            select: { nickname: true },
        });

        const existingPlayerNames = new Set(existingPlayers.map(player => player.nickname.toLowerCase()));

        console.log("Jogadores existentes no banco:", existingPlayerNames);

        for (const player of players) {
            const playerNickname = player.nick.toLowerCase();
            const pointsToIncrement = player.points || 0;

            if (existingPlayerNames.has(playerNickname)) {
                try {
                    await prisma.users.update({
                        where: { nickname: playerNickname },
                        data: {
                            oincPoints: { increment: pointsToIncrement },
                        },
                    });
                    console.log(`Pontos atualizados para o jogador: ${playerNickname}`);
                } catch (updateError) {
                    console.error(`Erro ao atualizar pontos do jogador: ${playerNickname}`, updateError);
                }
            }
        }

        const newPlayers = players
            .filter(player => !existingPlayerNames.has(player.nick.toLowerCase()))
            .map(player => ({
                userID: uuidv4(),
                nickname: player.nick.toLowerCase(),
                oincPoints: player.points || 0,
                role: "user",
                createdAt: new Date(),
            }));

        if (newPlayers.length > 0) {
            try {
                await prisma.users.createMany({ data: newPlayers });
                console.log("Novos jogadores inseridos:", newPlayers);
            } catch (createError) {
                console.error("Erro ao inserir novos jogadores:", createError);
            }
        }

        try {
            await prisma.dungeonsHistory.create({
                data: {
                    eventId,
                    dungeon,
                    players,
                },
            });
            console.log("Histórico de dungeon inserido com sucesso.");
        } catch (historyError) {
            console.error("Erro ao inserir histórico de dungeon:", historyError);
            return NextResponse.json(
                { message: "Erro ao inserir histórico de dungeon.", error: historyError },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Histórico inserido com sucesso" });
    } catch (error) {
        console.error("Erro inesperado ao processar a requisição:", error);
        return NextResponse.json(
            { message: "Erro inesperado ao processar a requisição.", error: error },
            { status: 500 }
        );
    }
}
