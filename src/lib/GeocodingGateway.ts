interface ReverseGeocodeResponse {
  displayName: string;
  road?: string;
  houseNumber?: string;
  suburb?: string;
  city: string;
  state?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
  latitude: string;
  longitude: string;
}

interface ForwardGeocodeAddress {
  village?: string;
  city?: string;
  county?: string;
  state?: string;
  region?: string;
  country?: string;
  countryCode?: string;
}

interface ForwardGeocodeResponse {
  placeId: string;
  displayName: string;
  name: string;
  latitude: string;
  longitude: string;
  address: ForwardGeocodeAddress;
  boundingBox?: string[];
}

export class GeocodingGateway {
  private readonly baseUrl: string;
  private readonly language: string;

  constructor(language: string = "pt-BR") {
    this.baseUrl = "https://nominatim.openstreetmap.org";
    this.language = language;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(
        `Geocoding API error: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }

  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<ReverseGeocodeResponse> {
    if (latitude === undefined || longitude === undefined) {
      throw new Error("Latitude and longitude are required");
    }

    const url = new URL(`${this.baseUrl}/reverse`);
    url.searchParams.append("format", "json");
    url.searchParams.append("lat", latitude.toString());
    url.searchParams.append("lon", longitude.toString());
    url.searchParams.append("zoom", "18");
    url.searchParams.append("addressdetails", "1");
    url.searchParams.append("accept-language", this.language);

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Tikko Frontend Web Application",
      },
    });

    const data = await this.handleResponse<any>(response);

    if (!data || !data.address) {
      throw new Error("Invalid response from geocoding API");
    }

    const cityValue =
      data.address.city || data.address.town || data.address.county || "";

    return {
      displayName: data.display_name || "",
      road: data.address.road,
      houseNumber: data.address.house_number,
      suburb: data.address.suburb,
      city: cityValue,
      state: data.address.state,
      postcode: data.address.postcode,
      country: data.address.country,
      countryCode: data.address.country_code,
      latitude: data.lat || latitude.toString(),
      longitude: data.lon || longitude.toString(),
    };
  }

  async forwardGeocode(
    query: string,
    limit: number = 10
  ): Promise<ForwardGeocodeResponse[]> {
    if (!query || query.trim() === "") {
      return [];
    }

    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.append("q", query);
    url.searchParams.append("format", "json");
    url.searchParams.append("addressdetails", "1");
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("accept-language", this.language);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": "Tikko Frontend Web Application",
        },
      });

      const data = await this.handleResponse<any[]>(response);

      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((item) => {
        const address = item.address || {};
        const name =
          item.name ||
          (item.display_name ? item.display_name.split(",")[0].trim() : "");

        return {
          placeId: item.place_id,
          displayName: item.display_name || "",
          name: name,
          latitude: item.lat || "",
          longitude: item.lon || "",
          address: {
            village: address.village,
            city: address.city || address.town || address.county,
            county: address.county,
            state: address.state,
            region: address.region,
            country: address.country,
            countryCode: address.country_code,
          },
          boundingBox: item.boundingbox,
        };
      });
    } catch (error) {
      console.error("Error in forward geocoding:", error);
      return [];
    }
  }
}
