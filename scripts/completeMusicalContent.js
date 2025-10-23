// Conteúdo completo de teoria musical - Método CCB MTS
// Estrutura progressiva com perguntas lúdicas e didáticas

const completeMusicalContent = {
  // NÍVEL APRENDIZ - Fundamentos da Música
  aprendiz: [
    {
      title: 'Propriedades do Som - Os Pilares da Música',
      description: 'Descubra as quatro propriedades fundamentais que definem cada som musical',
      category: 'propriedades-som',
      level: 'aprendiz',
      order: 1,
      points: 50,
      content: {
        theory: 'Todo som musical possui quatro propriedades essenciais: Altura (grave/agudo), Timbre (qualidade sonora), Intensidade (forte/fraco) e Duração (longo/curto).',
        examples: [
          { title: 'Altura', description: 'Dó é mais grave que Sol - como a diferença entre voz de homem e mulher' },
          { title: 'Timbre', description: 'Violino vs Piano - mesmo Dó, sons diferentes' },
          { title: 'Intensidade', description: 'Forte (f) vs Piano (p) - como gritar vs sussurrar' },
          { title: 'Duração', description: 'Semibreve vs Colcheia - como uma palavra longa vs curta' }
        ]
      },
      questions: [
        {
          question: '🎵 Qual das propriedades do som determina se uma nota é grave ou aguda?',
          options: [
            { id: 'A', label: 'Timbre', isCorrect: false },
            { id: 'B', label: 'Altura', isCorrect: true },
            { id: 'C', label: 'Intensidade', isCorrect: false },
            { id: 'D', label: 'Duração', isCorrect: false }
          ],
          explanation: 'A altura é a propriedade que determina se um som é grave (baixo) ou agudo (alto). É como a diferença entre a voz de um homem (grave) e de uma mulher (aguda).',
          difficulty: 'facil',
          points: 10
        },
        {
          question: '🎹 Se você toca a mesma nota Dó no piano e no violino, qual propriedade será diferente?',
          options: [
            { id: 'A', label: 'Altura', isCorrect: false },
            { id: 'B', label: 'Timbre', isCorrect: true },
            { id: 'C', label: 'Intensidade', isCorrect: false },
            { id: 'D', label: 'Duração', isCorrect: false }
          ],
          explanation: 'O timbre é a "cor" do som. Mesmo tocando a mesma nota, cada instrumento tem seu timbre característico - é por isso que reconhecemos se é piano ou violino.',
          difficulty: 'facil',
          points: 10
        },
        {
          question: '🔊 Qual símbolo musical indica que devemos tocar "bem baixinho"?',
          options: [
            { id: 'A', label: 'f (forte)', isCorrect: false },
            { id: 'B', label: 'p (piano)', isCorrect: true },
            { id: 'C', label: 'mf (mezzo forte)', isCorrect: false },
            { id: 'D', label: 'ff (fortíssimo)', isCorrect: false }
          ],
          explanation: 'O "p" significa piano (suave em italiano). A sequência é: pp (pianíssimo), p (piano), mp (mezzo piano), mf (mezzo forte), f (forte), ff (fortíssimo).',
          difficulty: 'medio',
          points: 15
        },
        {
          question: '⏱️ Qual propriedade do som está relacionada ao tempo que a nota dura?',
          options: [
            { id: 'A', label: 'Altura', isCorrect: false },
            { id: 'B', label: 'Timbre', isCorrect: false },
            { id: 'C', label: 'Intensidade', isCorrect: false },
            { id: 'D', label: 'Duração', isCorrect: true }
          ],
          explanation: 'A duração determina quanto tempo uma nota deve ser sustentada. Uma semibreve dura 4 tempos, uma colcheia dura meio tempo.',
          difficulty: 'facil',
          points: 10
        },
        {
          question: '🎼 Se você está tocando "piano" e quer ficar "forte", que símbolo usa?',
          options: [
            { id: 'A', label: 'Crescendo (<)', isCorrect: true },
            { id: 'B', label: 'Diminuendo (>)', isCorrect: false },
            { id: 'C', label: 'Forte (f)', isCorrect: false },
            { id: 'D', label: 'Piano (p)', isCorrect: false }
          ],
          explanation: 'O crescendo (<) indica aumento gradual da intensidade. É como dizer "vamos ficando mais forte aos poucos".',
          difficulty: 'medio',
          points: 15
        },
        {
          question: '🎵 Qual é a diferença entre "forte" e "fortíssimo"?',
          options: [
            { id: 'A', label: 'Forte é mais suave que fortíssimo', isCorrect: true },
            { id: 'B', label: 'Forte é mais alto que fortíssimo', isCorrect: false },
            { id: 'C', label: 'Não há diferença', isCorrect: false },
            { id: 'D', label: 'Forte é mais grave que fortíssimo', isCorrect: false }
          ],
          explanation: 'Forte (f) é intenso, mas fortíssimo (ff) é ainda mais intenso. É como a diferença entre falar alto e gritar.',
          difficulty: 'facil',
          points: 10
        },
        {
          question: '🎶 Qual propriedade permite distinguir um violino de um piano tocando a mesma nota?',
          options: [
            { id: 'A', label: 'Altura', isCorrect: false },
            { id: 'B', label: 'Timbre', isCorrect: true },
            { id: 'C', label: 'Intensidade', isCorrect: false },
            { id: 'D', label: 'Duração', isCorrect: false }
          ],
          explanation: 'O timbre é a "impressão digital" de cada instrumento. Mesmo tocando a mesma nota, cada um tem sua "cor" única.',
          difficulty: 'medio',
          points: 15
        }
      ]
    },
    {
      title: 'Notas Musicais e Solfejo - O ABC da Música',
      description: 'Aprenda as sete notas musicais e como cantá-las corretamente',
      category: 'solfegio-basico',
      level: 'aprendiz',
      order: 2,
      points: 50,
      content: {
        theory: 'As sete notas musicais são: Dó, Ré, Mi, Fá, Sol, Lá, Si. Elas formam a base de toda a música ocidental e podem ser cantadas usando o solfejo.',
        examples: [
          { title: 'Sequência', description: 'Dó-Ré-Mi-Fá-Sol-Lá-Si-Dó (oitava)' },
          { title: 'Clave de Sol', description: 'Símbolo que indica onde está o Sol' },
          { title: 'Pentagrama', description: 'As 5 linhas onde escrevemos as notas' }
        ]
      },
      questions: [
        {
          question: '🎵 Qual é a sequência correta das notas musicais?',
          options: [
            { id: 'A', label: 'Dó-Ré-Mi-Fá-Sol-Lá-Si', isCorrect: true },
            { id: 'B', label: 'A-B-C-D-E-F-G', isCorrect: false },
            { id: 'C', label: '1-2-3-4-5-6-7', isCorrect: false },
            { id: 'D', label: 'Dó-Mi-Sol-Fá-Lá-Ré-Si', isCorrect: false }
          ],
          explanation: 'A sequência correta é Dó-Ré-Mi-Fá-Sol-Lá-Si. É como o alfabeto da música!',
          difficulty: 'facil',
          points: 10
        },
        {
          question: '🎼 Qual nota vem depois de Fá na escala?',
          options: [
            { id: 'A', label: 'Mi', isCorrect: false },
            { id: 'B', label: 'Sol', isCorrect: true },
            { id: 'C', label: 'Lá', isCorrect: false },
            { id: 'D', label: 'Dó', isCorrect: false }
          ],
          explanation: 'Depois de Fá vem Sol. A sequência é: Dó-Ré-Mi-Fá-Sol-Lá-Si.',
          difficulty: 'facil',
          points: 10
        },
        {
          question: '🎹 Se você está cantando "Mi" e quer subir um tom, qual nota canta?',
          options: [
            { id: 'A', label: 'Ré', isCorrect: false },
            { id: 'B', label: 'Fá', isCorrect: true },
            { id: 'C', label: 'Sol', isCorrect: false },
            { id: 'D', label: 'Lá', isCorrect: false }
          ],
          explanation: 'De Mi para Fá é um tom. A sequência é: Dó-Ré-Mi-Fá-Sol-Lá-Si.',
          difficulty: 'medio',
          points: 15
        },
        {
          question: '🎵 Quantas linhas tem o pentagrama?',
          options: [
            { id: 'A', label: '3 linhas', isCorrect: false },
            { id: 'B', label: '4 linhas', isCorrect: false },
            { id: 'C', label: '5 linhas', isCorrect: true },
            { id: 'D', label: '7 linhas', isCorrect: false }
          ],
          explanation: 'O pentagrama tem 5 linhas e 4 espaços. É onde escrevemos as notas musicais.',
          difficulty: 'facil',
          points: 10
        },
        {
          question: '🎼 Qual símbolo indica onde está a nota Sol?',
          options: [
            { id: 'A', label: 'Clave de Fá', isCorrect: false },
            { id: 'B', label: 'Clave de Dó', isCorrect: false },
            { id: 'C', label: 'Clave de Sol', isCorrect: true },
            { id: 'D', label: 'Clave de Ré', isCorrect: false }
          ],
          explanation: 'A Clave de Sol (𝄞) indica onde está a nota Sol. É a mais usada para instrumentos agudos.',
          difficulty: 'medio',
          points: 15
        },
        {
          question: '🎵 Complete: Dó, Ré, Mi, ___, Sol, Lá, Si',
          options: [
            { id: 'A', label: 'Dó', isCorrect: false },
            { id: 'B', label: 'Fá', isCorrect: true },
            { id: 'C', label: 'Mi', isCorrect: false },
            { id: 'D', label: 'Ré', isCorrect: false }
          ],
          explanation: 'A sequência completa é: Dó-Ré-Mi-Fá-Sol-Lá-Si. Fá é a quarta nota.',
          difficulty: 'facil',
          points: 10
        },
        {
          question: '🎶 Qual é a diferença entre "Dó" e "Dó" (oitava)?',
          options: [
            { id: 'A', label: 'São a mesma nota', isCorrect: false },
            { id: 'B', label: 'O segundo Dó é uma oitava acima', isCorrect: true },
            { id: 'C', label: 'O segundo Dó é mais grave', isCorrect: false },
            { id: 'D', label: 'Não há diferença', isCorrect: false }
          ],
          explanation: 'O segundo Dó é uma oitava acima do primeiro - mais agudo, mas com o mesmo "nome". É como a diferença entre a voz de uma criança e de um adulto cantando a mesma nota.',
          difficulty: 'medio',
          points: 15
        }
      ]
    }
  ]
};

module.exports = { completeMusicalContent };



