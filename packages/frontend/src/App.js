import React, { Component } from "react";
import "./App.css";

class App extends React.Component {
  state = {
    lastKeyTimestamp: null,
    sameKeyRepetition: 0,
    text: "Hello Wo",
    t9Keys: {},
    suggestions: ["World", "Workraft", "Microft", "Microsoft", "Halooligan"]
  };

  onSuggestionSelect = word => {
    const { text } = this.state;

    const confirmedText = text.slice(0, text.lastIndexOf(" "));
    this.setState({ text: confirmedText + " " + word + " " });
  };

  append = c =>
    this.setState(state => {
      return { text: (state.text + c).replace(/\s+/g, " ") };
    });

  replaceLastChar = c =>
    this.setState(state => ({
      text: state.text.slice(0, state.text.length - 1) + c
    }));

  suggest = t9Keys => {
    console.log(t9Keys);
    // this.setState({});
  };

  onKey = (keyObject, keyboardMode, majuscule = false) => {
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
          this.setState({ text: "", t9Keys: {} });
          break;
        case "delete":
          this.setState(state => {
            const t9Keys = Object.assign({}, state.t9Keys);
            t9Keys[text.length - 1] && delete t9Keys[text.length - 1];
            return { text: text.slice(0, text.length - 1), t9Keys: t9Keys };
          });
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
      this.setState(state => {
        this.append(keyObject.alpha);
        return {
          t9Keys: {},
          suggestions: []
        };
      });
      return;
    }

    const suggestionCombination = [];

    if (keyboardMode === "ABC" || keyObject.num === 1) {
      this.setState(state => {
        const character = keyObject.alpha[state.sameKeyRepetition];

        const toInsert =
          (majuscule && character.toUpperCase()) || character || keyObject.num;

        suggestionCombination.push(toInsert);

        state.sameKeyRepetition > 0
          ? this.replaceLastChar(toInsert)
          : this.append(toInsert);
      });
    } else if (keyboardMode === "T9") {
      const possibleChars = keyObject.alpha.split("");
      possibleChars.push(keyObject.num);

      suggestionCombination.push(possibleChars);
    }

    // suggest
    this.setState(state => {
      const t9Keys = Object.assign({}, state.t9Keys, {
        [state.text.length]: suggestionCombination
      });
      this.suggest(t9Keys);

      return {
        t9Keys: t9Keys
      };
    });
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
    const lastWord = text.split(" ").pop() || "";

    const shouldHighlight =
      lastWord.length > 0 &&
      suggestion.length > 0 &&
      suggestion.toLowerCase().indexOf(lastWord.toLowerCase()) > -1;
    const confirmedText = shouldHighlight
      ? (text.lastIndexOf(" ") > 0 && text.slice(0, text.lastIndexOf(" "))) ||
        ""
      : text;
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
  constructor(props) {
    super(props);
    this.state = {
      words: ["World", "Workraft", "Microft", "Microsoft", "Halooligan"]
    };
  }
  render() {
    const { onSuggestionSelect } = this.props;
    return (
      <div class="suggestions noselect">
        {this.state.words.map((w, i) => (
          <span
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
    maj: false
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
