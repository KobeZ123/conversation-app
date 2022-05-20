import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, SafeAreaView, FlatList } from 'react-native';
import * as Speech from 'expo-speech';

// app main page component 
const App = () => {
  
  const [submittedText, setSubmittedText] = useState('');
  const [displayingInfo, setDisplayingInfo] = useState(false);
  const [promptList, setPromptList] = useState([]);
  const [page, setPage] = useState('input');
  if (page == 'input') {
    return (
      <View style={styles.app_container}>
        <Header />
        <TextInputWindow displayingInfo={displayingInfo} setDisplayingInfo={setDisplayingInfo} 
          promptList={promptList} setPromptList={setPromptList} setSubmittedText={setSubmittedText}
          setPage={setPage}/>
      </View>
    )
  }
  else if (page == 'output') {
    return (
      <View style={styles.app_container}>
        <Header />
        <ActionsWindow displayingInfo={displayingInfo} setDisplayingInfo={setDisplayingInfo}
          submittedText={submittedText} setPage={setPage} promptList={promptList} setPromptList={setPromptList}/>
      </View>
    )
  }
  else if (page == 'autoplay') {
    return (
      <View style={styles.app_container}>
        <Header />
        <AutoplayWindow setPage={setPage} promptList={promptList} setPromptList={setPromptList} 
          displayingInfo={displayingInfo} setDisplayingInfo={setDisplayingInfo}/>
      </View>
    )
  }
  else if (page == 'testing') {
    return (
      <View style={styles.app_container}>
        <Header />
        <TestModeWindow setPage={setPage} promptList={promptList} setPromptList={setPromptList} 
          displayingInfo={displayingInfo} setDisplayingInfo={setDisplayingInfo}/>
      </View>
    )
  }
}

// app header for the name and motto of app 
const Header = () => {
  return (
    <View style={{width: '100%', alignItems: 'center', 
      alignContent: 'center',backgroundColor: '#C5E3ED', marginBottom: 15, paddingVertical: 15}}>
      <Text
        style={{fontSize: 30, fontWeight: 'bold', margin: 10, textAlign: 'center'}}>
        CONVERSATION APP
      </Text>
      <Text
        style={{fontSize: 15, fontStyle: 'italic', margin: 10, textAlign: 'center'}}>
        your virtual conversationalist peer 
      </Text>
    </View>
  )
}

// text input and prompt display window 
const TextInputWindow = (props) => {
  const [inputtedText, setInputtedText] = useState('');
  return (
    <View style={styles.view_container}>
      <InfoButton onPress={() => props.setDisplayingInfo(!props.displayingInfo)} />
      <AppInfoSection display={props.displayingInfo}/>
      <TextInput 
        style={styles.text_input}
        placeholder="Enter sentence(s) here"
        onChangeText={newText => setInputtedText(newText)}
        defaultValue={inputtedText} 
        multiline={true}
        selectTextOnFocus={true}
      />
      <Pressable 
        style={styles.button}
        onPress={() => {
          if (inputtedText != '') {
            props.setPromptList(textToList(inputtedText)); 
            props.setSubmittedText(inputtedText); 
            props.setDisplayingInfo(false); 
            props.setPage('output');}}}>
        <Text style={styles.button_text}>
          SUBMIT TEXT
        </Text>
      </Pressable>
    </View>
  )
}

// prompt list and action options 
const ActionsWindow = (props) => {
  return (
    <View style={styles.view_container}>
      <InfoButton onPress={() => props.setDisplayingInfo(!props.displayingInfo)} />
      <PromptInfoSection display={props.displayingInfo}/>
      <FunctionButton text="SHUFFLE" color='#4285f4'
        onPress={() => {props.setPromptList(shuffleList(props.promptList)); 
        console.log('shuffling');}}/>
      <FunctionButton text="AUTOPLAY" color='#4285f4'
        onPress={() => {console.log('autoplay mode'); props.setPage('autoplay'); 
        props.setDisplayingInfo(false);}}/>
      <FunctionButton text="TEST MODE" color='#4285f4'
        onPress={() => { console.log('testing'); props.setPage('testing');
        props.setDisplayingInfo(false);}}/> 
        
      <SubmittedTextDisplay submittedText={props.submittedText} promptList={props.promptList} />
      <FunctionButton text="BACK" color='#FFCCCB'
        onPress={() => {props.setPage('input'); props.setDisplayingInfo(false);}}/> 
    </View>
  )
}

// autoplay window 
const AutoplayWindow = (props) => {
  const [delayTime, setDelayTime] = useState(5);
  return (
    <View style={styles.view_container}>
      <InfoButton onPress={() => props.setDisplayingInfo(!props.displayingInfo)} />
      <AutoplayInfoSection display={props.displayingInfo}/>
      <FunctionButton text="START AUTOPLAY" color='#4285f4'
        onPress={() => {console.log("starting autoplay"); 
        readList(props.promptList, delayTime * 1000, 0);}}/>
      <Text
        style={{fontSize: 20, fontWeight: 'bold', margin: 15}}>
        SET TIME DELAY
      </Text>
      <TextInput
        style={styles.number_input}
        keyboardType='numeric'
        maxLength={10}
        value={delayTime}
        onChangeText={(text) => {setDelayTime(text.replace(/[^0-9]/g, ''));}}
        />
      <Text
        style={{fontSize: 20, fontWeight: 'bold', margin: 15}}>
        Conversation Points 
      </Text>
      <PromptList promptList={props.promptList}/>
      <FunctionButton text="BACK" color='#FFCCCB'
        onPress={() => {props.setPage('output'); props.setDisplayingInfo(false);}}/>
    </View>
  )
}

// test mode window 
const TestModeWindow = (props) => {
  const [progress, setProgress] = useState(0);
  const [stillTesting, setStillTesting] = useState(true);
  return (
    <View style={styles.view_container}>
      <InfoButton onPress={() => props.setDisplayingInfo(!props.displayingInfo)} />
      <TestModeInfoSection display={props.displayingInfo}/>
      <Pressable style={styles.test_button} disabled={!stillTesting}
        onPress={() => {setStillTesting(progress < props.promptList.length);
          if (progress < props.promptList.length) {
            textToSpeech(props.promptList[progress].key); 
            setProgress(progress + 1);
          }
          else {
            textToSpeech("end of prompts");
          }}}>
        <Text 
        style={{fontSize: 30, fontWeight: 'bold'}}>
          TEST
        </Text>
      </Pressable>
      <FunctionButton text="RESET" color='#FFCCCB'
        onPress={() => {setProgress(0); setStillTesting(true);}}/>
      
      <FunctionButton text="BACK" color='#FFCCCB'
        onPress={() => {props.setPage('output'); props.setDisplayingInfo(false);}}/>
    </View>
  )
}

// submission button component 
// props.onPress to pass in action after pressing 
const InfoButton = (props) => {
  return (
    <Pressable 
      style={styles.info_button}
      onPress={props.onPress}>
      <Text
        style={{fontSize: 15, fontWeight: 'bold', color: '#FFFFFF'}}>
        i
      </Text>
    </Pressable>
  )
}

// component that provides the user with information about the app 
// props.display to pass in boolean of whether to display the component or not 
const AppInfoSection = (props) => {
  if (props.display) {
    return (
      <View style={[styles.view_container, {backgroundColor: '#FFFFFF', 
        paddingHorizontal: 30, paddingVertical: 10, margin: 15, borderRadius: 10, textAlign: 'center'}]}>
        <Text style={{fontSize: 15}}> 
          The <i>Conversation App</i> is your virtual conversationalist peer here to help you to practice and simulate conversations. 
          <br/>Enter the prompts that you would like to use, 
          separated by periods, question marks, exclamation marks, or line breaks
        </Text>
      </View>
    )
  }
  return null;
}


// component that provides the user with information about how to use the prompt list 
// props.display to pass in boolean of whether to display the component or not 
const PromptInfoSection = (props) => {
  if (props.display) {
    return (
      <View style={[styles.view_container, {backgroundColor: '#FFFFFF', 
        paddingHorizontal: 30, paddingVertical: 10, margin: 15, borderRadius: 10, textAlign: 'center'}]}>
        <Text style={{fontSize: 15}}> 
          Using the prompts you have entered, you can play them one by one or use the following features 
          <br/> <b>SHUFFLE</b>: randomizes the order of prompts
          <br/> <b>AUTOPLAY</b>: plays the prompts consecutively with a set response time between 
          <br/> <b>TEST MODE</b>: enters test mode where the prompts are played on command with a recording functionality 
        </Text>
      </View>
    )
  }
  return null;
}

// component that provides the user with information about how to use autoplay
// props.display to pass in boolean of whether to display the component or not 
const AutoplayInfoSection = (props) => {
  if (props.display) {
    return (
      <View style={[styles.view_container, {backgroundColor: '#FFFFFF', 
        paddingHorizontal: 30, paddingVertical: 10, margin: 15, borderRadius: 10, textAlign: 'center'}]}>
        <Text style={{fontSize: 15}}> 
          Autoplay mode enables you to hear all the prompts hands-free. 
          <br/> Press <b>START AUTOPLAY</b> for the prompts to begin playing!
          <br/> <i>*press the button only <b>ONCE</b>*</i>
          <br/> Adjust the delay time between prompts by entering a value in seconds
        </Text>
      </View>
    )
  }
  return null;
}

// component that provides the user with information about how to use test mode
// props.display to pass in boolean of whether to display the component or not 
const TestModeInfoSection = (props) => {
  if (props.display) {
    return (
      <View style={[styles.view_container, {backgroundColor: '#FFFFFF', 
        paddingHorizontal: 30, paddingVertical: 10, margin: 15, borderRadius: 10, textAlign: 'center'}]}>
        <Text style={{fontSize: 15}}> 
          Test Mode will play prompts on-command without text references 
          <br/> Press <b>TEST</b> to play a prompt 
          <br/> <i>*allow the prompt to finish before pressing a new prompt*</i>
        </Text>
      </View>
    )
  }
  return null;
}

// functional button component 
// props.text to pass the text of the button 
// props.onPress to pass function for the onPress of the button 
const FunctionButton = (props) => {
  return (
    <Pressable 
      style={[styles.button, {backgroundColor: props.color}]}
      onPress={props.onPress}>
      <Text style={styles.button_text}>
        {props.text}
      </Text>
    </Pressable>
  )
}


// component that displays submitted text as raw input and as a list of sentences 
// props.submittedText to pass in string of submitted text
// props.promptList to pass in array of strings 
const SubmittedTextDisplay = (props) => {
  if (props.promptList.length != 0) {
    return (
      <View style={styles.view_container}>
        {/* <Text
          style={{fontSize: 20, fontWeight: 'bold', margin: 15}}>
            Text Input
        </Text>
        <Text
          style={{fontSize: 20, margin: 5}}>
          {props.submittedText}
        </Text> */}
        <Text
          style={{fontSize: 20, fontWeight: 'bold', margin: 15}}>
            Conversation Points 
        </Text>
        <PromptList promptList={props.promptList}/>
      </View>  
    )
  }
  return null;
}


// item component for SentenceList 
// props.text to pass in a string prompt 
const PromptItem = (props) => {
  return (
    <View>
      <Text 
        style={styles.sentence_text}
        onPress={() => textToSpeech(props.text)}>
        {props.text}
      </Text>
    </View>
  )
}


// component that takes a string input and creates a list of sentences from the list 
// props.promptList to pass in an array of prompts 
const PromptList = (props) => {
  return (
    <SafeAreaView>
      <FlatList
        contentContainerStyle ={{alignItems: 'center'}}
        data={props.promptList}
        renderItem={({item}) => <PromptItem text={item.key}/>}
      />
    </SafeAreaView>
  )
}

// returns a list given a string input 
function textToList(textInput) {
  let data = [];
  // splits the text input by punctuation
  let result = textInput.split(/[.!?;\r?\n]/);
  for (let i = 0; i < result.length; i = i + 1) {
    // deals with spaces counting as a new sentence 
    if (result[i].trim().length != 0) {
      data.push({key: result[i].trim()});
    }
  }
  return data;
}

// returns a shuffled list 
function shuffleList(list) {
  let list_copy = [];
  let shuffled_list = [];
  for (let i = 0; i < list.length; i = i + 1) {
    list_copy.push(list[i]);
  }
  while (list_copy.length != 0) {
    let randIndex = Math.floor(Math.random() * list_copy.length);
    console.log(list_copy.length + ' : ' + randIndex);
    shuffled_list.push(list_copy[randIndex]);
    console.log('pushing ' + list_copy[randIndex].key);
    list_copy.splice(randIndex, 1);
  }
  return shuffled_list;
}


// this function does text-to-speech on the argument text
function textToSpeech(text) { 
  // https://www.netguru.com/blog/react-native-text-to-speech
  Speech.stop();
  Speech.speak(text);
}

// this function takes a list of prompts and reads them one by one with the set time between 
function readList(list, timeBetween, count) {
  
  if (count == 0) {
    Speech.stop();
    Speech.speak(list[count].key);
    if (count < list.length - 1) {
      readList(list, timeBetween, count + 1);
    }
  }
  else {
    setTimeout(function() {
      Speech.speak(list[count].key);
      if (count < list.length - 1) {
        readList(list, timeBetween, count + 1);
      }
    }, timeBetween);
  }
}

const styles = StyleSheet.create({
  app_container: {
    backgroundColor: '#ADD8E6',
    alignItems: 'center',
    fontFamily: 'Helvetica',
    height: '100%'
  },
  view_container: {
    width: '90%',
    alignItems: 'center',
    alignContent: 'center',
  },
  info_button: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    backgroundColor: '#0000FF',
    borderRadius: 30
  },
  text_input: {
    width: '90%',
    height: 200,
    padding: 15,
    marginVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 15
  },
  button: {
    backgroundColor: '#4285f4', 
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 5
  },
  button_text: {
    fontSize: 15,
    fontWeight: 'bold'
  },
  sentence_text: {
    fontSize: 20, 
    backgroundColor: '#75E6DA', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 10, 
    margin: 5
  },
  number_input: {
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold'
  }, 
  test_button: {
    backgroundColor: '#90EE90',
    margin: 15, 
    padding: 100,
    borderRadius: 200
  }
});

export default App;
