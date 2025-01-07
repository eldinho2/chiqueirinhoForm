interface PlayerData {
  nick: string;
  role: string;
  points: number;
  damage: string;
  heal: string;
  maxDps: string;
  maxPercentage: string;
}

const eloService = async (formatedData: PlayerData[]) => {
  for (const player of formatedData) {
    const { nick, role } = player;

    try {
      const userIdResponse = await fetch(`/api/getUserId/${nick}`);
      if (!userIdResponse.ok) {
        console.error(`Failed to fetch userId for ${nick}: ${userIdResponse.statusText}`);
        continue;
      }
      const userId = await userIdResponse.json();

      const userProfileResponse = await fetch(`/api/getUserProfile/${userId}`);
      if (!userProfileResponse.ok) {
        console.error(`Failed to fetch profile for userId ${userId}: ${userProfileResponse.statusText}`);
        continue;
      }
      const userProfile = await userProfileResponse.json();

      const roleData = userProfile.highestStats.allPlayersRoles


      const playerObject = {
        nick,
        roleData
      } 

      await fetch(`${process.env.NEXT_PUBLIC_BOT_BACKEND_URL}/handleUpdateElos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerObject }),
        });

    } catch (error) {
      console.error(`Error processing player ${nick}:`, error);
    }
  }
};

export default eloService;
