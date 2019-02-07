import React, { Component } from "react";
import "./App.css";

const keyMap = [
  ["a", "b", "c", "2"],
  ["d", "e", "f", "3"],
  ["g", "h", "i", "4"],
  ["j", "k", "l", "5"],
  ["m", "n", "o", "6"],
  ["p", "q", "r", "s", "7"],
  ["t", "u", "v", "8"],
  ["w", "x", "y", "z", "9"]
];

const indexOfAinB = (A, B) =>
  A.length > 0 && B.length > 0 && B.toLowerCase().indexOf(A.toLowerCase());

class App extends React.Component {
  state = {
    lastKeyTimestamp: null,
    sameKeyRepetition: 0,
    text: "",
    t9Keys: {},
    suggestions: [],
    onlyEnglishWords: true
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.text !== this.state.text) this.suggest();
  }

  // call backend to suggest words
  backendApiCall = async keys => {
    try {
      // fetch
      const suggestionsResponse = await fetch(
        "http://localhost:8080/api/suggestions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            keys: keys,
            onlyEnglish: this.state.onlyEnglishWords
          })
        }
      );

      //handle non success states
      if (suggestionsResponse.status >= 400)
        throw new Error(
          suggestionsResponse.status,
          await suggestionsResponse.text()
        );

      //update state
      const suggestions = (await suggestionsResponse.json()).suggestions || [];
      return suggestions;
    } catch (ex) {
      console.log("couldn't fetch suggestions", ex);
      return [];
    }
  };

  suggest = async () => {
    let lastWord = this.state.text.split(" ").pop() || "";

    // clear suggestions on empty
    if (!lastWord)
      return {
        suggestions: [],
        t9Keys: {}
      };

    // construct list of keys from last word
    const t9Keys = lastWord.split("").reduce((acc, c) => {
      const key = keyMap.find(key => key.indexOf(c) > -1) || null;
      if (key) acc[Object.keys(acc).length] = key;
      return acc;
    }, {});

    const lastPressedKeystamp = this.state.lastKeyTimestamp;

    const suggestions = await this.backendApiCall(t9Keys);

    // if train moved just discard!
    if (this.state.lastKeyTimestamp !== lastPressedKeystamp) return;

    // replace last digits from the available suggestion if possible
    const selectedSuggestion = suggestions.length > 0 && suggestions[0];

    selectedSuggestion && this.append(selectedSuggestion, false, true);

    this.setState({
      t9Keys: t9Keys,
      suggestions: suggestions
    });
  };

  // append string to text
  append = (str, replaceLastChar, replaceLastWord) => {
    this.setState(state => {
      let text = state.text;
      if (replaceLastChar) text = state.text.substr(0, state.text.length - 1);
      if (replaceLastWord) text = text.substr(0, text.lastIndexOf(" ")) + " ";
      text = (text + str).replace(/\s+/g, " ");

      return { text: text };
    });
  };

  // Handle keyboard input
  onKey = (keyObject, keyboardMode, maj = false) => {
    this.setState(state => {
      const isSameAsPreviousKey =
        keyboardMode === "ABC" &&
        Date.now() - state.lastKeyTimestamp < 300 &&
        keyObject.alpha &&
        keyObject.alpha.indexOf(state.text.split("").pop()) >= 0;

      return {
        lastKeyTimestamp: Date.now(),
        sameKeyRepetition: isSameAsPreviousKey ? state.sameKeyRepetition + 1 : 0
      };
    });

    const text = this.state.text;

    if (keyObject.action) {
      switch (keyObject.action) {
        case "trash":
          this.setState({ text: "" });
          break;
        case "delete":
          this.setState({ text: text.slice(0, text.length - 1) });
          break;
        case "copy":
          //this.state.text
          //TODO: copy to clipboard and show a toast
          break;
      }
      return;
    }

    if (keyboardMode === "123") {
      this.append(keyObject.num >= 0 ? keyObject.num : keyObject.alpha);
      return;
    }

    if (keyObject.alpha == " " || keyObject.alpha === "\n") {
      this.append(keyObject.alpha);
      return;
    }

    if (keyboardMode === "ABC" || keyObject.num === 1) {
      this.setState(state => {
        const character = keyObject.alpha[state.sameKeyRepetition];

        const toInsert =
          (maj && character.toUpperCase()) || character || keyObject.num;

        this.append(toInsert, state.sameKeyRepetition > 0);
      });
    } else if (keyboardMode === "T9") {
      this.append(keyObject.num);
    }
  };

  onSuggestionSelect = word => {
    this.append(word + " ", false, true);
  };

  render() {
    const suggestionWord = this.state.suggestions[0] || "";

    return (
      <div class="wrap">
        <div class="display noselect">
          <DisplayText text={this.state.text} suggestion={suggestionWord} />
          <Suggestions
            suggestions={this.state.suggestions}
            onSuggestionSelect={this.onSuggestionSelect}
          />
        </div>
        <Keyboard onKey={this.onKey} />
      </div>
    );
  }
}

class DisplayText extends React.Component {
  render() {
    const { text, suggestion } = this.props;
    let lastWord = text.split(" ").pop() || "";

    // handle highlighting in text
    const shouldHighlight = indexOfAinB(lastWord, suggestion) > -1;

    const confirmedText =
      ((text.lastIndexOf(" ") > 0 && text.slice(0, text.lastIndexOf(" "))) ||
        "") +
      " " +
      (shouldHighlight ? "" : lastWord);

    const highlighted = (shouldHighlight && lastWord) || "";

    const complement =
      (shouldHighlight &&
        suggestion.slice(
          suggestion.toLowerCase().indexOf(lastWord.toLowerCase()) +
            lastWord.length
        )) ||
      "";

    return (
      <div class="relative">
        {confirmedText}
        {highlighted && (
          <span>
            {" "}
            <span class="display-word-selected">{highlighted}</span>
          </span>
        )}
        <div class="cursor" />
        {complement && (
          <span class="display-word-selected-complement">{complement}</span>
        )}
      </div>
    );
  }
}

class Suggestions extends React.Component {
  render() {
    const { suggestions, onSuggestionSelect } = this.props;
    return (
      <div class="suggestions noselect">
        {suggestions.map((w, i) => (
          <span
            key={i}
            class={"suggest-word " + (i == 0 ? "suggest-word-selected" : "")}
            onClick={e => {
              onSuggestionSelect(e.target.innerText);
            }}
          >
            {w}
          </span>
        ))}
      </div>
    );
  }
}

class Keyboard extends React.Component {
  state = {
    layout: {
      key1: { id: "key1", offset: 1, num: 1, alpha: ".,!?" },
      key2: { id: "key2", offset: 2, num: 2, alpha: "abc" },
      key3: { id: "key3", offset: 3, num: 3, alpha: "def" },
      trash: {
        id: "trash",
        offset: 4,
        action: "trash",
        circle: true,
        icon: <Trash />
      },
      key4: { id: "key4", offset: 5, num: 4, alpha: "ghi" },
      key5: { id: "key5", offset: 6, num: 5, alpha: "jkl" },
      key6: { id: "key6", offset: 7, num: 6, alpha: "mno" },
      copy: {
        id: "copy",
        offset: 8,
        action: "copy",
        circle: true,
        icon: <Copy />
      },
      key7: { id: "key7", offset: 9, num: 7, alpha: "pqrs" },
      key8: { id: "key8", offset: 10, num: 8, alpha: "tuv" },
      key9: { id: "key9", offset: 11, num: 9, alpha: "wxyz" },
      mode: { id: "mode", offset: 12, action: "mode", circle: true },
      maj: { id: "maj", offset: 13, action: "maj", circle: true, alpha: "MAJ" },
      key0: { id: "key0", offset: 14, num: 0, alpha: " ", icon: <Delete /> },
      delete: {
        id: "delete",
        offset: 15,
        action: "delete",
        circle: true,
        icon: <Delete />
      },
      newLine: {
        id: "newLine",
        offset: 16,
        alpha: "\n",
        circle: true,
        icon: <CornerDownLeft />
      }
    },
    mode: "T9", // t9 / ABC / 123
    maj: true
  };

  buttonClicked = key => {
    const keyObj = this.state.layout[key];
    // handle keyboard related clicks
    switch (keyObj.action) {
      case "maj":
        this.toggleMAJ();
        break;
      case "mode":
        this.toggleMode();
        break;
      default:
        this.props.onKey(keyObj, this.state.mode, this.state.maj);
        if (this.state.maj) this.toggleMAJ();

        break;
    }
  };

  toggleMode() {
    const modes = ["T9", "ABC", "123"];
    const nextMode = modes[modes.indexOf(this.state.mode) + 1] || modes[0];
    this.setState({ mode: nextMode });
  }

  toggleMAJ() {
    this.setState(state => ({ maj: !state.maj }));
  }

  render() {
    return (
      <div class="keyboard">
        {Object.keys(this.state.layout)
          .sort((a, b) => {
            return this.state.layout[a].offset - this.state.layout[b].offset;
          })
          .map(key => {
            const {
              offset,
              action,
              num,
              alpha,
              circle,
              icon
            } = this.state.layout[key];
            return (
              <Button
                key={key}
                offset={offset}
                circle={circle}
                uppercase={this.state.maj}
                onClick={() => this.buttonClicked(key)}
              >
                {(key === "mode" && this.state.mode) ||
                  (key === "maj" && (this.state.maj ? "maj" : "MAJ")) ||
                  (this.state.mode === "123" && num >= 0 && num + "") ||
                  icon ||
                  alpha}
              </Button>
            );
          })}
      </div>
    );
  }
}

const Button = ({ children, circle = false, uppercase, onClick }) => (
  <div className="btn-container">
    <div
      onClick={onClick}
      className={
        "btn noselect" +
        ((circle && " circle") || "") +
        ((!circle && uppercase && " uppercase") || "")
      }
    >
      {children}
    </div>
  </div>
);

const Icon = props => {
  const { color, size, children, ...otherProps } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      {children}
    </svg>
  );
};

Icon.defaultProps = {
  color: "currentColor",
  size: "50%"
};

const CornerDownLeft = ({ ...props }) => (
  <Icon {...props}>
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </Icon>
);

const Copy = ({ ...props }) => (
  <Icon {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
);

const Delete = ({ ...props }) => (
  <Icon {...props}>
    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <line x1="18" y1="9" x2="12" y2="15" />
    <line x1="12" y1="9" x2="18" y2="15" />
  </Icon>
);

const Trash = ({ ...props }) => (
  <Icon {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
);

export default App;
