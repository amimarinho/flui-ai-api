import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { isPlaceCategory } from './placeQuery';
import { AskedPlace, PlacesService } from './places.service';

@Injectable()
export class AskService {
  constructor(private readonly places: PlacesService) {}

  async ask(
    text: string,
    latitude: number,
    longitude: number,
  ): Promise<AskedPlace[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini is not configured.');
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
      contents: text,
      config: {
        systemInstruction:
          'Call search_places when the user asks for places that charge electric cars or lugares que carregam carros elétricos (ev_charging), coffee shops or cafeterias (coffee), or gas stations and postos de gasolina (gas_station). Leave the tool uncalled for any other request.',
        tools: [
          {
            functionDeclarations: [
              {
                name: 'search_places',
                description:
                  'Look up nearby places in one category: electric-car charging, coffee, or gas stations.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    category: {
                      type: Type.STRING,
                      enum: ['ev_charging', 'coffee', 'gas_station'],
                      description:
                        'ev_charging for electric-car charging, coffee for coffee shops, gas_station for postos de gasolina.',
                    },
                  },
                  required: ['category'],
                },
              },
            ],
          },
        ],
      },
    });

    const call = response.functionCalls?.[0];
    if (!call || call.name !== 'search_places') {
      return [];
    }

    const category = call.args?.category;
    if (!isPlaceCategory(category)) {
      return [];
    }

    const places = await this.places.search(category, latitude, longitude);
    return places.map(
      ({ name, category: placeCategory, latitude: lat, longitude: lng }) => ({
        name,
        category: placeCategory,
        latitude: lat,
        longitude: lng,
      }),
    );
  }
}

