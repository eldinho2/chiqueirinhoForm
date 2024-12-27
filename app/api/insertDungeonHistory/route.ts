import { NextResponse } from "next/server";
import prisma from "@/services/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log("Payload recebido:", body);

        const { dungeon, eventId, players } = body;

        if (!dungeon || !eventId || !Array.isArray(players) || players.length === 0) {
            return NextResponse.json(
                { message: "Dados inválidos: 'dungeon', 'eventId' ou 'players' ausentes ou no formato incorreto." },
                { status: 400 }
            );
        }

        const invalidPlayers = players.filter(
            player => !player.nick || typeof player.nick !== "string"
        );

        if (invalidPlayers.length > 0) {
            return NextResponse.json(
                { message: "Alguns jogadores possuem dados inválidos.", invalidPlayers },
                { status: 400 }
            );
        }

        console.log("Jogadores válidos:", players);

        const existingPlayers = await prisma.users.findMany({
            where: {
                name: { in: players.map(player => player.nick.toLowerCase()) },
            },
            select: { name: true },
        });

        const existingPlayerNames = new Set(existingPlayers.map(player => player.name.toLowerCase()));

        console.log("Jogadores já cadastrados:", existingPlayerNames);

        const newPlayers = players
            .filter(player => !existingPlayerNames.has(player.nick.toLowerCase()))
            .map(player => ({
                userID: uuidv4(),
                name: player.nick.toLowerCase(),
                role: "user",
                createdAt: new Date(),
            }));

        console.log("Jogadores novos a serem criados:", newPlayers);

        if (newPlayers.length > 0) {
            await prisma.users.createMany({ data: newPlayers });
        }

       await prisma.dungeonsHistory.create({
           data: {
               eventId,
               dungeon,
               players: players,
           },
       });


        return NextResponse.json({ message: "Histórico inserido com sucesso"});
    } catch (error) {
        console.error("Erro ao inserir histórico de dungeon:", error);
        return NextResponse.json(
            { message: "Erro ao processar a requisição", error: error },
            { status: 500 }
        );
    }
}
