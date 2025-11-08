export class ProAPIsService {
  async enrichLinkedinUrl(linkedinUrl: string) {
    let slug = linkedinUrl.split("/in/")[1];
    if (!slug) {
      throw new Error("Invalid LinkedIn URL format");
    }

    // Remove trailing slash
    if (slug.endsWith("/")) {
      slug = slug.slice(0, -1);
    }

    const proAPIsURL = `https://api.proapis.com/iscraper/v4/profile-details`;
    const response = await fetch(proAPIsURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.PRO_APIS_KEY as string,
      },
      body: JSON.stringify({
        profile_id: slug,
        profile_type: "personal",
        bypass_cache: false,
        related_profiles: false,
        network_info: true,
        contact_info: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`ProAPIs error: ${response.statusText}`);
    }

    const data = await response.json();

    const enrichmentData = {
      entity_urn: data.entity_urn,
      profile_id: data.profile_id,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: data.full_name,
      sub_title: data.sub_title,
      location: data.location,
      position_groups: data.position_groups,
      education: data.education,
      skills: data.skills,
      languages: data.languages,
      certifications: data.certifications,
      summary: data.summary,
    };

    return enrichmentData;
  }
}
