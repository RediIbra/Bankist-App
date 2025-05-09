const allQuestions = [
    { question: "Why is saving money important?", options: ["A. So you can spend more right away", "B. To prepare for emergencies and reach goals", "C. Because parents tell you to", "D. To avoid earning more"], correctAnswer: 1 },
    { question: "What is a budget?", options: ["A. A loan from a bank", "B. A tool to increase your income", "C. A shopping list", "D. A plan for how you’ll spend and save money"], correctAnswer: 3 },
    { question: "What does a checking account help with?", options: ["A. Earning interest on savings", "B. Everyday spending with a debit card", "C. Buying stocks", "D. Taking out loans"], correctAnswer: 1 },
    { question: "What is a credit score?", options: ["A. A score you get when you win a game", "B. A measure of your financial health", "C. A fee you pay to the bank", "D. A method of saving money"], correctAnswer: 2 },
    { question: "Which of the following is an asset?", options: ["A. A house you own", "B. A car you lease", "C. A monthly rent payment", "D. A vacation debt"], correctAnswer: 0 },
    { question: "What is the best way to build credit?", options: ["A. Buy everything in cash", "B. Avoid using your credit card", "C. Let your bills pile up", "D. Use credit responsibly and make payments on time"], correctAnswer: 3 },
    { question: "What is an emergency fund?", options: ["A. A fund for entertainment", "B. A savings for unexpected expenses", "C. A fund for investments", "D. Money you borrow from friends"], correctAnswer: 1 },
    { question: "What is compound interest?", options: ["A. Interest on the initial deposit only", "B. Interest on both the principal and the accumulated interest", "C. Interest on the loan amount", "D. Interest on savings bonds"], correctAnswer: 1 },
    { question: "What is the purpose of insurance?", options: ["A. To guarantee you will never have to pay for anything", "B. To protect against financial loss", "C. To make money", "D. To increase debt"], correctAnswer: 1 },
    { question: "What is a loan?", options: ["A. Money you borrow and repay with interest", "B. Money you give away", "C. Money you save", "D. Money you earn from investments"], correctAnswer: 0 },
    { question: "What is the stock market?", options: ["A. A place to buy and sell stocks and bonds", "B. A place to get loans", "C. A place to get insurance", "D. A bank"], correctAnswer: 0 },
    { question: "What is a savings account?", options: ["A. A place to save money for short-term goals", "B. A loan account", "C. A credit card account", "D. A checking account"], correctAnswer: 0 },
    { question: "What is financial planning?", options: ["A. A strategy for getting rich quickly", "B. Organizing your finances for short and long-term goals", "C. Avoiding taxes", "D. Making investments only"], correctAnswer: 1 },
    { question: "What is a retirement fund?", options: ["A. Money you can use for a vacation", "B. Money saved for when you're older and no longer working", "C. Money you spend on education", "D. A place to store extra cash"], correctAnswer: 1 },
    { question: "What is inflation?", options: ["A. A decrease in prices over time", "B. An increase in the money supply", "C. A steady increase in the price of goods and services", "D. The stock market crash"], correctAnswer: 2 },
    { question: "What is diversification?", options: ["A. Putting all your money in one place", "B. Spreading investments across different assets to reduce risk", "C. Saving money in cash only", "D. Avoiding risk at all costs"], correctAnswer: 1 },
    { question: "What is a credit card?", options: ["A. A card to borrow money for purchases", "B. A savings tool", "C. A debit card", "D. A loan for a house"], correctAnswer: 0 },
    { question: "What is the difference between saving and investing?", options: ["A. Saving involves putting money aside for the future, investing aims to grow your wealth", "B. Saving is always better", "C. Investing is for emergencies", "D. There’s no difference"], correctAnswer: 0 },
    { question: "What is a financial advisor?", options: ["A. Someone who gives free money", "B. Someone who provides financial advice", "C. A bank employee", "D. A loan officer"], correctAnswer: 1 },
    { question: "What is a mutual fund?", options: ["A. A group of stocks owned by an individual", "B. A type of bank account", "C. A pooled investment managed by a professional", "D. A way to store money"], correctAnswer: 2 },
    { question: "What is a bond?", options: ["A. A type of loan", "B. A stock", "C. A savings account", "D. A type of insurance"], correctAnswer: 0 },
    { question: "What is a tax refund?", options: ["A. Money you receive from the government after paying too much tax", "B. Money paid to the government", "C. Money used to pay for investments", "D. Money you give to your bank"], correctAnswer: 0 },
    { question: "What is a paycheck?", options: ["A. Money you earn from work", "B. Money you borrow", "C. Money you save", "D. A loan agreement"], correctAnswer: 0 },
    { question: "What is debt?", options: ["A. Money you owe", "B. Money you invest", "C. Money you save", "D. Money you earn"], correctAnswer: 0 }
  ];

  // Shuffle function to randomize the order of questions
  function shuffleQuestions(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
    }
  }

  // Select 10 random questions from allQuestions
  function getRandomQuestions() {
    const shuffledQuestions = [...allQuestions];
    shuffleQuestions(shuffledQuestions);
    return shuffledQuestions.slice(0, 10);
  }

  const questions = getRandomQuestions();

  let correctAnswers = 0;
  const totalQuestions = questions.length;
  let answeredQuestions = 0;

  const quizContainer = document.getElementById('quiz-container');
  questions.forEach((question, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('quiz-question');
    questionDiv.innerHTML = `
      <h3>${index + 1}. ${question.question}</h3>
      <div class="options">
        ${question.options.map((option, i) => `<button>${option}</button>`).join('')}
      </div>
      <div class="result"></div>
    `;
    quizContainer.appendChild(questionDiv);

    const buttons = questionDiv.querySelectorAll('button');
    const resultDiv = questionDiv.querySelector('.result');

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.disabled = true);
        if (i === question.correctAnswer) {
          btn.classList.add('correct');
          resultDiv.textContent = "✅ Correct!";
          correctAnswers++;
        } else {
          btn.classList.add('incorrect');
          buttons[question.correctAnswer].classList.add('correct');
          resultDiv.textContent = "❌ Wrong. The correct answer is highlighted.";
        }

        answeredQuestions++;

        // Once all questions are answered, display the modal
        if (answeredQuestions === totalQuestions) {
          displayModal();
        }
      });
    });
  });

  // Display modal with final score and corrections
  function displayModal() {
    const modal = document.getElementById('modal');
    const scoreResult = document.getElementById('score-result');
    const corrections = document.getElementById('corrections');
    const scoreText = document.getElementById('score-text');
    const scoreContainer = document.getElementById('score-container');
    modal.style.display = 'flex';

    scoreResult.textContent = `You got ${correctAnswers} out of ${totalQuestions} correct!`;
    corrections.innerHTML = questions.map((question, index) => {
      const selectedOption = document.querySelectorAll('.quiz-question')[index].querySelectorAll('button');
      const correctOption = selectedOption[question.correctAnswer];
      return `<p><strong>Q${index + 1}: </strong>${question.question}<br> Correct Answer: ${correctOption.textContent}</p>`;
    }).join('');

    scoreContainer.style.display = 'none'; // Hide score container when modal is shown
    scoreText.textContent = `${correctAnswers} / ${totalQuestions} Correct`;

  }

  // Close the modal
  function closeModal() {
    const modal = document.getElementById('modal');
    const scoreContainer = document.getElementById('score-container');
    modal.style.display = 'none';
    scoreContainer.style.display = 'flex'; // Show score container when modal is closed
  }

  // Reload the quiz
  function reloadQuiz() {
    window.location.reload();
  }