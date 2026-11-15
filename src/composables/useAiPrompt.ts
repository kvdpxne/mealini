import {computed} from 'vue'
import {useFridgeStore} from '@/stores/fridge.store'
import {useShoppingStore} from '@/stores/shopping.store'
import {formatQuantity} from '@/lib/quantity'

export function useAiPrompt() {
  const fridgeStore = useFridgeStore()
  const shoppingStore = useShoppingStore()

  const prompt = computed(() => {
    const fridge = fridgeStore.items
      .map(i => `- ${i.name}: ${formatQuantity(i.quantity, i.unit)}`)
      .join('\n')

    const shopping = shoppingStore.toBuy
      .map(i => `- ${i.name} (${formatQuantity(i.quantity, i.unit)})`)
      .join('\n')

    return `Jesteś asystentem kucharskim. Na podstawie dostępnych produktów zaproponuj DOKŁADNIE 3 proste przepisy do przygotowania teraz.

DANE:
LODÓWKA (dostępne od razu):
${fridge || '(lodówka pusta)'}

LISTA ZAKUPÓW (opcjonalnie, jeszcze nie masz):
${shopping || '(brak)'}

ZASADY:
1. Używaj głównie produktów z lodówki. Lista zakupów może być użyta tylko jako opcjonalny dodatek; nie zakładaj, że kupię więcej niż 1–2 produkty z listy.
2. Nie wymyślaj składników spoza listy. Dozwolona bez oznaczania jest woda. Sól i podstawowe przyprawy tylko jeśli są na liście; jeśli nie, zaznacz „jeśli masz”.
3. Przy niejasnych ilościach przyjmij rozsądne założenie i wypisz je w „Uwagi” (np. 1 opak. jajek = 10 szt.; 1 szt. produktu pakowanego = 1 opak.).
4. Każdy przepis: 2 porcje, max 30 min, poziom łatwy, max 8 składników.
5. Jeśli brakuje kluczowego składnika, podaj wersję bez niego lub prosty zamiennik.
6. Nie używaj produktów, które nie pasują kulinarnie (np. chipsy, napoje), tylko po to, by wykorzystać wszystko.
7. Odpowiedz po polsku, zwięźle, bez wstępu, bez pytań. Jeśli czegoś brakuje, podejmij założenie i zaznacz je.

FORMAT DLA KAŻDEGO PRZEPISU:
1. Nazwa: ...
Czas: ... min | Porcje: 2 | Sprzęt: ...
Składniki:
- ...
Przygotowanie (max 5 kroków, każdy max 2 zdania):
1. ...
Uwagi/zamienniki: ...
    `
  })

  return {prompt}
}