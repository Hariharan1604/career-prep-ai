ASSESSMENT_QUESTIONS = {
    "Python": [
        {
            "question": "What is the output of `print(type([]) is list)`?",
            "options": ["True", "False", "TypeError", "None"],
            "correct": 0,
            "explanation": "`type([])` returns `<class 'list'>`, and `is` checks identity. Since `list` is the same class object, this returns `True`.",
            "difficulty": "easy"
        },
        {
            "question": "Which of the following is NOT a valid way to create a dictionary in Python?",
            "options": [
                "dict(a=1, b=2)",
                "{'a': 1, 'b': 2}",
                "dict([('a', 1), ('b', 2)])",
                "dict{'a': 1, 'b': 2}"
            ],
            "correct": 3,
            "explanation": "`dict{...}` is not valid Python syntax. You can use `dict()` constructor, literal `{...}`, or `dict()` with an iterable of key-value pairs.",
            "difficulty": "easy"
        },
        {
            "question": "What is the primary difference between a list and a tuple in Python?",
            "options": [
                "Lists are ordered, tuples are unordered",
                "Lists are mutable, tuples are immutable",
                "Lists can contain different data types, tuples cannot",
                "Lists are faster to access than tuples"
            ],
            "correct": 1,
            "explanation": "The key difference is mutability. Lists can be modified after creation, while tuples cannot.",
            "difficulty": "easy"
        }
    ],
    "SQL": [
        {
            "question": "Which SQL clause is used to filter the results of a GROUP BY clause?",
            "options": ["WHERE", "ORDER BY", "HAVING", "FILTER"],
            "correct": 2,
            "explanation": "The HAVING clause is used to filter groups created by GROUP BY, while WHERE filters individual rows before grouping.",
            "difficulty": "medium"
        },
        {
            "question": "What does a LEFT JOIN do?",
            "options": [
                "Returns all records from both tables",
                "Returns only matching records from both tables",
                "Returns all records from the left table, and matched records from the right table",
                "Returns all records from the right table, and matched records from the left table"
            ],
            "correct": 2,
            "explanation": "A LEFT JOIN (or LEFT OUTER JOIN) returns all rows from the left table, even if there are no matches in the right table.",
            "difficulty": "easy"
        }
    ],
    "Machine Learning": [
        {
            "question": "What happens when a model is overfitting?",
            "options": [
                "It performs poorly on training data and well on test data",
                "It performs well on training data and poorly on test data",
                "It performs well on both training and test data",
                "It performs poorly on both training and test data"
            ],
            "correct": 1,
            "explanation": "Overfitting occurs when a model learns the training data too well, including its noise, causing it to fail to generalize to new, unseen test data.",
            "difficulty": "easy"
        },
        {
            "question": "Which of the following is a technique to prevent overfitting?",
            "options": ["Decreasing training data", "Adding more parameters", "Cross-validation", "Removing regularization"],
            "correct": 2,
            "explanation": "Cross-validation helps ensure the model generalizes well. Regularization is another key technique (removing it would increase overfitting).",
            "difficulty": "medium"
        }
    ],
    "Deep Learning": [
        {
            "question": "What is the purpose of an activation function in a neural network?",
            "options": [
                "To initialize the weights",
                "To introduce non-linearity",
                "To calculate the loss",
                "To update the weights during backpropagation"
            ],
            "correct": 1,
            "explanation": "Activation functions introduce non-linearity to the network, allowing it to learn complex patterns. Without them, the network would just be a linear regression model.",
            "difficulty": "medium"
        },
        {
            "question": "Which problem does the ReLU activation function help solve compared to Sigmoid?",
            "options": [
                "Exploding gradients",
                "Vanishing gradients",
                "High computational cost",
                "Both B and C"
            ],
            "correct": 3,
            "explanation": "ReLU does not saturate for positive values (preventing vanishing gradients) and is computationally much cheaper to calculate than the exponential in Sigmoid.",
            "difficulty": "medium"
        }
    ],
    "Docker": [
        {
            "question": "What is a Dockerfile?",
            "options": [
                "A script to start Docker daemon",
                "A text document containing commands to build an image",
                "A running instance of an image",
                "A volume for persistent storage"
            ],
            "correct": 1,
            "explanation": "A Dockerfile is a text document that contains all the commands a user could call on the command line to assemble an image.",
            "difficulty": "easy"
        }
    ],
    "React": [
        {
            "question": "What is the purpose of the useEffect hook in React?",
            "options": [
                "To manage state variables",
                "To handle routing",
                "To perform side effects in function components",
                "To render the component's UI"
            ],
            "correct": 2,
            "explanation": "useEffect is used to perform side effects (data fetching, subscriptions, manual DOM manipulation) in function components.",
            "difficulty": "easy"
        }
    ]
}
