import React, { Component } from 'react';

import 'prismjs';
import loadLanguages from 'prismjs/components/index.js';
import 'prismjs/plugins/keep-markup/prism-keep-markup.js';
import 'prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.js';
import 'prismjs/plugins/unescaped-markup/prism-unescaped-markup.js';

import 'reveal.js/css/reveal.css';
import 'reveal.js/css/theme/serif.css';
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/plugins/unescaped-markup/prism-unescaped-markup.css';

import './slide-deck.css';

export class SlideDeck extends Component {
  componentDidMount() {
    loadLanguages(['groovy', 'json', 'jsx', 'flow', 'typescript']); // why groovy? Exactly.
    require.ensure(
      [
        'reveal.js',
        'reveal.js/lib/js/classList.js',
        'reveal.js/lib/js/head.min.js',
        'reveal.js/lib/js/html5shiv.js'
      ],
      () => {
        const Reveal = require('reveal.js');
        require('reveal.js/lib/js/classList.js');
        require('reveal.js/lib/js/head.min.js');
        require('reveal.js/lib/js/html5shiv.js');

        window.Reveal = Reveal;

        Reveal.initialize({
          history: true,
          margin: 0.1,
          dependencies: [
            {
              async: true,
              src: require('reveal.js/plugin/zoom-js/zoom.js')
            },
            {
              async: true,
              src: require('reveal.js/plugin/markdown/marked.js')
            },
            {
              async: true,
              src: require('reveal.js/plugin/notes/notes.js')
            }
          ]
        });
        let times = {};
        Reveal.addEventListener(
          'slidechanged',
          function(event) {
            console.log(times);
            let timenow = Math.round(event.timeStamp / 1000);
            let previousSlideName = event.previousSlide.childNodes.item(0)
              .textContent;
            if (previousSlideName.includes('Who am I')) {
              previousSlideName = 'Who am I';
            }
            if (previousSlideName.includes('Munroe-Meyer Institute')) {
              previousSlideName = 'Intro Slide';
            }
            let dictlen = Object.keys(times).length;
            if (dictlen === 0) {
              times[previousSlideName] = timenow;
              times['previousTime'] = timenow;
            } else {
              let newtime = timenow - times['previousTime'];
              times[previousSlideName] = newtime;
              times['previousTime'] = timenow;
            }
          },
          false
        );

        Reveal.addEventListener(
          'ending',
          function(event) {
            var tbl = document.createElement('table');
            tbl.className = 'reveal table slide center ready';
            var tblBody = document.createElement('tbody');
            var header = document.createElement('th');
            var header2 = document.createElement('th');
            var header1cellText = document.createTextNode('Slide');
            var header2cellText = document.createTextNode('Time (Seconds)');
            header.append(header1cellText);
            header2.append(header2cellText);
            tbl.append(header);
            tbl.append(header2);

            for (var key in times) {
              if (key !== 'previousTime') {
                var row = document.createElement('tr');
                var cell1 = document.createElement('td');
                var cell2 = document.createElement('td');
                var cell1Text = document.createTextNode(key);
                var cell2Text = document.createTextNode(times[key]);
                cell1.append(cell1Text);
                cell2.append(cell2Text);
                row.append(cell1);
                row.append(cell2);
                tblBody.append(row);
              }
            }
            tbl.append(tblBody);
            console.log(document.getElementById('theend').childElementCount);
            if (document.getElementById('theend').childElementCount === 1) {
              document.getElementById('theend').appendChild(tbl);
            } else {
              console.log(document.getElementById('theend').childNodes.item(1));
              console.log(tbl);
              document
                .getElementById('theend')
                .removeChild(
                  document.getElementById('theend').childNodes.item(1)
                );
              document.getElementById('theend').appendChild(tbl);
            }
          },
          false
        );
      }
    );
  }

  getSectionProps(html) {
    const section = html.match(/<section[^>]+/);
    if (!section) {
      return {};
    }

    const props = section
      .pop()
      .replace(/<section\s/, '')
      .split(/([\w-]+)="([^"]+)"/)
      .filter(part => part && part.length > 0);

    return props.reduce((merged, part, index) => {
      if (part % 1 === 0) {
        merged[part] = '';
      } else if (props[index - 1]) {
        merged[props[index - 1]] = part;
      }
      return merged;
    }, {});
  }

  render() {
    const { slides } = this.props;
    const { PRESENTATION_DATE: date } = process.env;
    return (
      <div className="reveal">
        <div className="slides">
          <section data-state="title">
            <h3>Munroe-Meyer Institute Physical Therapy Department</h3>
            <h3>Time-Keeping Project</h3>
            <h5>July 31, 2019</h5>
          </section>
          {slides.map((deck, deckIndex) => {
            return (
              <section key={deckIndex}>
                {deck.map((html, slideIndex) => {
                  const key = `${deckIndex}-${slideIndex}`;
                  if (html.default) {
                    const Slide = html.default;
                    return (
                      <section key={key}>
                        <Slide />
                      </section>
                    );
                  }
                  const sectionProps = this.getSectionProps(html);
                  return (
                    <section
                      key={key}
                      {...sectionProps}
                      dangerouslySetInnerHTML={{ __html: html }} // #yolo
                    />
                  );
                })}
              </section>
            );
          })}
          <section id={'theend'} data-state="ending">
            <h3>Questions</h3>
          </section>
        </div>
      </div>
    );
  }
}
