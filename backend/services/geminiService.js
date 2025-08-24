import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const extractDataFromResume = async (resumeText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Extract the following information from this resume text and return it as a JSON object. 
    Generate a professional cover letter based on the resume content (2-3 paragraphs highlighting skills and experience).
    
    Required format:
    {
      "name": "Full name of the person",
      "email": "Email address",
      "phone": "Phone number with proper formatting",
      "address": "Full address or city, state",
      "coverLetter": "Generate a professional 2-3 paragraph cover letter based on the resume highlighting the person's experience, skills, and enthusiasm for the role. Make it personalized based on their background."
    }
    
    Resume text:
    ${resumeText}
    
    If any field is not found in the resume, leave it as an empty string. 
    For the cover letter, always generate one based on the available information.
    Make sure the response is valid JSON only, wrapped in triple backticks with json language identifier.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to extract JSON from response');
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to process resume with AI');
  }
};

// New function for extracting comprehensive profile data
export const extractProfileDataFromResume = async (resumeText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are an expert resume parser. Extract comprehensive and detailed profile information from this resume text.
    Be thorough and extract EVERY piece of relevant information, no matter how small.
    
    CRITICAL REQUIREMENTS:
    1. Extract ALL skills mentioned anywhere in the resume (technical, software, programming languages, tools, soft skills)
    2. For projects, extract complete details including technologies, descriptions, and achievements
    3. For education, include ALL educational background including certifications, courses, training
    4. For experience, include detailed job descriptions and achievements
    
    Required JSON format:
    {
      "personalInfo": {
        "name": "Full name (extract from resume)",
        "email": "Email address if found",
        "phone": "Phone number if found",
        "bio": "Generate a comprehensive 3-4 sentence professional bio based on the entire resume content, highlighting key strengths and experience",
        "location": {
          "city": "City name if mentioned",
          "country": "Country name if mentioned"
        }
      },
      "experience": [
        {
          "jobTitle": "Exact job title as mentioned",
          "company": "Company name",
          "location": "Work location if mentioned",
          "startDate": "YYYY-MM-DD format (use best estimate if incomplete)",
          "endDate": "YYYY-MM-DD format or null if current job",
          "isCurrentJob": true/false,
          "description": "Detailed description including responsibilities, achievements, technologies used, and impact. Combine all bullets and details into comprehensive paragraph.",
          "skills": ["List ALL technologies, tools, and skills mentioned for this job"]
        }
      ],
      "education": [
        {
          "degree": "Full degree name (Bachelor's, Master's, PhD, Certificate, etc.)",
          "institution": "Complete institution name",
          "fieldOfStudy": "Field of study/major",
          "startDate": "YYYY-MM-DD format",
          "endDate": "YYYY-MM-DD format",
          "grade": "GPA, percentage, or grade if mentioned",
          "description": "Include relevant coursework, projects, achievements, honors, thesis topics, etc."
        }
      ],
      "projects": [
        {
          "title": "Complete project name",
          "description": "Comprehensive project description including purpose, scope, methodology, challenges solved, results achieved, and impact",
          "technologies": ["List ALL technologies, programming languages, frameworks, tools, platforms used"],
          "startDate": "YYYY-MM-DD format (estimate if needed)",
          "endDate": "YYYY-MM-DD format (estimate if needed)",
          "projectUrl": "Live project URL if mentioned",
          "githubUrl": "GitHub/repository URL if mentioned",
          "status": "Completed (default) or In Progress"
        }
      ],
      "skills": [
        {
          "name": "Individual skill name",
          "level": "Beginner/Intermediate/Advanced/Expert (estimate based on context and experience)",
          "category": "Programming/Framework/Database/Tool/Soft Skill/Other"
        }
      ]
    }
    
    EXTRACTION GUIDELINES:
    
    SKILLS EXTRACTION (Most Important):
    - Extract EVERY technical skill, programming language, framework, library, tool, software mentioned
    - Include skills from job descriptions, project sections, education, certifications
    - Extract both explicitly listed skills and skills implied from project descriptions
    - Include: Programming languages (JavaScript, Python, Java, etc.), Frameworks (React, Angular, etc.), 
      Databases (MySQL, MongoDB, etc.), Tools (Git, Docker, AWS, etc.), Software (Photoshop, AutoCAD, etc.)
    - Estimate skill level based on: years of experience, project complexity, job responsibilities
    - Categories: Programming (languages), Framework (libraries/frameworks), Database (databases), 
      Tool (software/tools), Soft Skill (communication, leadership), Other (everything else)
    
    PROJECT EXTRACTION:
    - Extract ALL projects mentioned (personal, academic, professional, freelance)
    - Include projects from work experience if they're described separately
    - For each project, extract: full description, ALL technologies used, timeline, achievements, links
    - If technologies aren't explicitly listed, infer from project description
    - Include impact metrics, user numbers, performance improvements if mentioned
    
    EDUCATION EXTRACTION:
    - Include formal education (degrees, diplomas)
    - Include certifications, online courses, training programs, bootcamps
    - Include relevant coursework, final projects, thesis topics
    - Include academic achievements, honors, scholarships, publications
    
    EXPERIENCE EXTRACTION:
    - Extract complete job descriptions with achievements and impact
    - Include internships, freelance work, volunteer work if mentioned
    - Quantify achievements when possible (numbers, percentages, metrics)
    - Include all technologies and tools used in each role
    
    DATE HANDLING:
    - For incomplete dates: if only year given, use YYYY-01-01
    - For ranges like "2020-2022", use 2020-01-01 to 2022-12-31
    - For "Present" or "Current", use null for endDate and set isCurrentJob to true
    - Make reasonable estimates for missing dates based on context
    
    Resume text:
    ${resumeText}
    
    Return ONLY valid JSON. Be comprehensive and extract every detail possible.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    //    console.log('Gemini AI Response:', text); // Removed to avoid logging sensitive data
    
    // Clean the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extractedData = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the data
      const validCategories = ['Programming', 'Framework', 'Database', 'Tool', 'Soft Skill', 'Other'];
      const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
      
      // Clean and validate skills
      const cleanedSkills = Array.isArray(extractedData.skills) ? 
        extractedData.skills.map(skill => ({
          name: (skill.name || '').trim(),
          level: validLevels.includes(skill.level) ? skill.level : 'Intermediate',
          category: mapToValidCategory(skill.category, skill.name)
        })).filter(skill => skill.name && skill.name.length > 0) : [];
      
      // Clean and validate experience
      const cleanedExperience = Array.isArray(extractedData.experience) ? 
        extractedData.experience.map(exp => ({
          ...exp,
          description: (exp.description || '').trim(),
          skills: Array.isArray(exp.skills) ? exp.skills.filter(s => s && s.trim().length > 0) : []
        })).filter(exp => exp.jobTitle && exp.company) : [];
      
      // Clean and validate education
      const cleanedEducation = Array.isArray(extractedData.education) ? 
        extractedData.education.map(edu => ({
          ...edu,
          description: (edu.description || '').trim()
        })).filter(edu => edu.degree && edu.institution) : [];
      
      // Clean and validate projects
      const cleanedProjects = Array.isArray(extractedData.projects) ? 
        extractedData.projects.map(project => ({
          ...project,
          description: (project.description || '').trim(),
          technologies: Array.isArray(project.technologies) ? 
            project.technologies.filter(tech => tech && tech.trim().length > 0) : []
        })).filter(project => project.title && project.description) : [];
      
      // Clean personal info
      const cleanedPersonalInfo = {
        name: (extractedData.personalInfo?.name || '').trim(),
        email: (extractedData.personalInfo?.email || '').trim(),
        phone: (extractedData.personalInfo?.phone || '').trim(),
        bio: (extractedData.personalInfo?.bio || '').trim(),
        location: {
          city: (extractedData.personalInfo?.location?.city || '').trim(),
          country: (extractedData.personalInfo?.location?.country || '').trim()
        }
      };
      
      return {
        personalInfo: cleanedPersonalInfo,
        experience: cleanedExperience,
        education: cleanedEducation,
        projects: cleanedProjects,
        skills: cleanedSkills
      };
    }
    
    throw new Error('Failed to extract JSON from response');
  } catch (error) {
    console.error('Gemini AI Profile Extraction Error:', error);
    throw new Error('Failed to process resume for profile data');
  }
};

// Helper function to map any category to valid enum values
const mapToValidCategory = (category, skillName) => {
  if (!category && !skillName) return 'Other';
  
  const categoryLower = (category || '').toLowerCase();
  const skillLower = (skillName || '').toLowerCase();
  
  // Programming languages and concepts (comprehensive list)
  if (categoryLower.includes('programming') || 
      categoryLower.includes('language') ||
      categoryLower.includes('coding') ||
      skillLower.match(/\b(javascript|typescript|python|java|c\+\+|c#|php|ruby|go|rust|swift|kotlin|scala|perl|r|matlab|c|objective-c|dart|lua|haskell|clojure|erlang|elixir|f#|vb\.net|assembly|cobol|fortran|pascal|delphi|prolog|lisp|scheme|smalltalk|ada|apex|abap|pl\/sql|t-sql|html|css|scss|sass|less|xml|json|yaml|markdown|latex|bash|shell|powershell|batch|awk|sed|regex)\b/)) {
    return 'Programming';
  }
  
  // Frameworks and libraries (comprehensive list)
  if (categoryLower.includes('framework') || 
      categoryLower.includes('library') ||
      categoryLower.includes('runtime') ||
      skillLower.match(/\b(react|angular|vue|svelte|ember|backbone|jquery|bootstrap|tailwind|material-ui|ant-design|chakra-ui|semantic-ui|bulma|foundation|express|koa|fastify|nest|next|nuxt|gatsby|remix|astro|django|flask|fastapi|pyramid|tornado|rails|sinatra|laravel|symfony|codeigniter|cakephp|zend|yii|spring|struts|hibernate|mybatis|play|akka|vert\.x|quarkus|micronaut|dropwizard|spark|jsf|wicket|tapestry|grails|vaadin|gwt|android|ios|flutter|xamarin|cordova|phonegap|ionic|react-native|expo|electron|tauri|nw\.js|pwa|unity|unreal|godot|cocos2d|phaser|three\.js|babylon\.js|webgl|opencv|tensorflow|pytorch|keras|scikit-learn|pandas|numpy|matplotlib|seaborn|plotly|d3\.js|chart\.js|highcharts|apache|nginx|tomcat|jetty|websphere|weblogic|iis|caddy|traefik|envoy|istio|consul|vault|terraform|ansible|puppet|chef|saltstack|vagrant|packer|docker|kubernetes|openshift|helm|skaffold|tilt|minikube|kind|rancher|nomad|mesos|swarm|ecs|fargate|lambda|azure-functions|cloud-functions|firebase|supabase|amplify|vercel|netlify|heroku|digitalocean|linode|vultr|hetzner)\b/)) {
    return 'Framework';
  }
  
  // Databases (comprehensive list)
  if (categoryLower.includes('database') || 
      categoryLower.includes('db') ||
      categoryLower.includes('sql') ||
      categoryLower.includes('nosql') ||
      skillLower.match(/\b(mysql|postgresql|sqlite|mariadb|oracle|sql-server|access|db2|sybase|informix|teradata|vertica|greenplum|netezza|snowflake|redshift|bigquery|databricks|clickhouse|timescaledb|cockroachdb|yugabytedb|mongodb|couchdb|couchbase|cassandra|scylladb|dynamodb|cosmosdb|firebase|firestore|realm|neo4j|arangodb|orientdb|dgraph|tigergraph|janusgraph|amazon-neptune|redis|memcached|hazelcast|ignite|elasticsearch|solr|lucene|sphinx|algolia|typesense|meilisearch|vespa|opensearch|kibana|grafana|prometheus|influxdb|telegraf|chronograf|kapacitor|victoria-metrics|thanos|cortex|jaeger|zipkin|opentelemetry|datadog|new-relic|splunk|elk|efk|fluentd|logstash|filebeat|metricbeat|winlogbeat|packetbeat|heartbeat|auditbeat|functionbeat|journalbeat)\b/)) {
    return 'Database';
  }
  
  // Tools and software (comprehensive list)
  if (categoryLower.includes('tool') || 
      categoryLower.includes('software') ||
      categoryLower.includes('platform') ||
      categoryLower.includes('ide') ||
      categoryLower.includes('editor') ||
      categoryLower.includes('cad') ||
      categoryLower.includes('design') ||
      categoryLower.includes('analysis') ||
      categoryLower.includes('testing') ||
      categoryLower.includes('deployment') ||
      categoryLower.includes('monitoring') ||
      categoryLower.includes('security') ||
      skillLower.match(/\b(git|github|gitlab|bitbucket|mercurial|svn|perforce|bazaar|fossil|darcs|monotone|cvs|rcs|sourcetree|gitkraken|smartgit|gitpod|codespaces|replit|stackblitz|codesandbox|jsfiddle|codepen|jsbin|vscode|sublime|atom|vim|emacs|nano|notepad\+\+|brackets|phpstorm|webstorm|intellij|eclipse|netbeans|xcode|android-studio|visual-studio|code-blocks|dev-c\+\+|qt-creator|clion|rider|datagrip|goland|rubymine|pycharm|appcode|fleet|zed|nova|textmate|bbedit|ultraedit|editplus|notepad|gedit|kate|kwrite|bluefish|komodo|aptana|dreamweaver|frontpage|expression|blend|sketch|figma|adobe-xd|invision|principle|framer|protopie|marvel|balsamiq|wireframe|mockplus|justinmind|axure|uxpin|origami|flinto|keynote|powerpoint|prezi|canva|photoshop|illustrator|indesign|lightroom|after-effects|premiere|final-cut|davinci-resolve|blender|maya|3ds-max|cinema-4d|houdini|zbrush|substance|marvelous-designer|autocad|solidworks|fusion-360|inventor|catia|creo|nx|rhino|sketchup|revit|archicad|bentley|microstation|civil-3d|plant-3d|recap|navisworks|tekla|staad|etabs|safe|sap2000|robot|advance-design|idea-statica|midas|diana|abaqus|ansys|comsol|matlab|simulink|labview|multisim|proteus|altium|eagle|kicad|cadence|mentor|synopsys|xilinx|altera|quartus|vivado|ise|diamond|lattice|microsemi|actel|docker|kubernetes|vagrant|vmware|virtualbox|parallels|qemu|xen|hyper-v|proxmox|citrix|nutanix|openstack|cloudstack|eucalyptus|apache-cloudstack|mesos|marathon|chronos|aurora|airflow|luigi|prefect|dagster|kubeflow|mlflow|dvc|wandb|tensorboard|jupyter|colab|kaggle|databricks|sagemaker|azure-ml|gcp-ai|watson|h2o|dataiku|alteryx|tableau|power-bi|qlik|looker|metabase|superset|grafana|kibana|splunk|datadog|new-relic|dynatrace|appdynamics|pingdom|uptime-robot|statuspage|pagerduty|opsgenie|victorops|xmatters|slack|teams|discord|zoom|webex|google-meet|skype|gotomeeting|bluejeans|jitsi|big-blue-button|jira|confluence|trello|asana|monday|notion|clickup|airtable|basecamp|wrike|smartsheet|microsoft-project|openproject|redmine|mantis|bugzilla|youtrack|linear|shortcut|pivotal-tracker|rally|versionone|azure-devops|tfs|jenkins|travis-ci|circleci|gitlab-ci|github-actions|bitbucket-pipelines|teamcity|bamboo|codeship|drone|buildkite|semaphore|appveyor|wercker|concourse|spinnaker|argo|flux|tekton|brigade|prow|lighthouse|knative|serverless|sam|chalice|zappa|claudia|apex|up|now|vercel|netlify|surge|firebase|amplify|heroku|zeit|render|railway|fly|deno-deploy|cloudflare-workers|edge|lambda|azure-functions|google-functions|alibaba-functions|tencent-functions|huawei-functions|oracle-functions|postman|insomnia|hoppscotch|thunder-client|rest-client|curl|wget|httpie|newman|artillery|k6|jmeter|locust|gatling|blazemeter|loader|webpagetest|lighthouse|pagespeed|gtmetrix|pingdom-tools|uptrends|dotcom-monitor|selenium|cypress|playwright|puppeteer|protractor|webdriver|testcafe|nightwatch|codecept|detox|appium|espresso|xctest|junit|testng|mockito|jasmine|mocha|chai|jest|ava|tape|qunit|karma|protractor|cucumber|behave|lettuce|specflow|fitnesse|robot-framework|gauge|spock|rspec|minitest|pytest|unittest|nose|doctest|hypothesis|factory-boy|faker|wiremock|mockserver|vcr|betamax|cassette|pact|contract-testing|chaos-engineering|gremlin|chaos-monkey|litmus|chaos-toolkit|pumba|toxiproxy|blockade|comcast|tc|netem|socat|netcat|nmap|wireshark|tcpdump|ngrep|iftop|nethogs|iotop|htop|top|ps|kill|killall|jobs|bg|fg|nohup|screen|tmux|byobu|termux|iterm|hyper|alacritty|kitty|wezterm|windows-terminal|powershell|cmd|bash|zsh|fish|sh|csh|tcsh|ksh|dash|ash|busybox|alpine|ubuntu|debian|centos|rhel|fedora|opensuse|arch|manjaro|gentoo|slackware|freebsd|openbsd|netbsd|solaris|aix|hpux|macos|windows|linux|unix|android|ios|watchos|tvos|tizen|webos|kaios|harmonyos|fuchsia|aws|azure|gcp|alibaba-cloud|tencent-cloud|huawei-cloud|oracle-cloud|ibm-cloud|digitalocean|linode|vultr|hetzner|ovh|scaleway|rackspace|godaddy|namecheap|cloudflare|fastly|maxcdn|keycdn|stackpath|bunnycdn|jsdelivr|cdnjs|unpkg|npm|yarn|pnpm|bower|composer|pip|conda|gem|cargo|go-mod|maven|gradle|ant|sbt|leiningen|mix|hex|pub|nuget|chocolatey|homebrew|macports|fink|pkgin|portage|yum|dnf|apt|dpkg|rpm|deb|snap|flatpak|appimage|homebrew-cask|scoop|winget|ninite|wireshark|burp-suite|owasp-zap|metasploit|nessus|openvas|nikto|sqlmap|john-the-ripper|hashcat|aircrack-ng|nmap|masscan|zmap|fierce|dnsrecon|sublist3r|amass|gobuster|dirb|dirbuster|wfuzz|ffuf|hydra|medusa|crunch|cewl|maltego|recon-ng|spiderfoot|shodan|censys|zoomeye|fofa|hunter|dehashed|breach-parse|haveibeenpwned|pipl|spokeo|whitepages|truecaller|social-searcher|osint-framework|maltego|casefile|i2-analyst-notebook|palantir|tableau|gephi|cytoscape|networkx|igraph|snap|graph-tool|boost-graph|lemon|ogdf|tulip|yfiles|graphviz|plantuml|draw\.io|lucidchart|visio|omnigraffle|creately|gliffy|smartdraw|edrawmax|conceptdraw|yworks|tom-sawyer|keylines|cambridge-intelligence|neo4j-bloom|gephi|cytoscape|pajek|ucinet|nodexl|r-igraph|python-networkx|scala-graph|java-jung|c\+\+-boost|javascript-d3|javascript-cytoscape|javascript-vis|javascript-sigma|javascript-linkurious)\b/)) {
    return 'Tool';
  }
  
  // Soft skills (comprehensive list)
  if (categoryLower.includes('soft') || 
      categoryLower.includes('communication') ||
      categoryLower.includes('leadership') ||
      categoryLower.includes('management') ||
      categoryLower.includes('interpersonal') ||
      skillLower.match(/\b(leadership|management|communication|teamwork|collaboration|problem-solving|critical-thinking|analytical|creativity|innovation|adaptability|flexibility|time-management|organization|planning|coordination|delegation|motivation|mentoring|coaching|training|presentation|public-speaking|negotiation|conflict-resolution|decision-making|strategic-thinking|emotional-intelligence|empathy|patience|resilience|stress-management|multitasking|attention-to-detail|quality-assurance|customer-service|client-relations|stakeholder-management|vendor-management|supplier-relations|partner-relations|business-development|sales|marketing|networking|relationship-building|trust-building|rapport-building|active-listening|feedback|constructive-criticism|open-mindedness|curiosity|continuous-learning|self-motivation|initiative|proactivity|accountability|responsibility|reliability|dependability|punctuality|professionalism|ethics|integrity|honesty|transparency|confidentiality|discretion|cultural-awareness|diversity|inclusion|global-mindset|cross-cultural|multilingual|language|translation|interpretation|documentation|technical-writing|copywriting|content-creation|editing|proofreading|research|data-analysis|reporting|visualization|storytelling|narrative|persuasion|influence|charisma|confidence|assertiveness|diplomacy|tact|sensitivity|awareness|observation|intuition|insight|wisdom|judgment|common-sense|practicality|efficiency|productivity|optimization|improvement|enhancement|refinement|polish|finesse|craftsmanship|artistry|aesthetics|design-thinking|user-experience|user-interface|human-factors|ergonomics|accessibility|usability|functionality|utility|value|benefit|advantage|edge|competitive|differentiation|uniqueness|specialization|expertise|mastery|excellence|quality|standards|best-practices|methodologies|frameworks|processes|procedures|protocols|guidelines|policies|compliance|governance|risk-management|security|safety|health|environment|sustainability|green|eco-friendly|social-responsibility|corporate-responsibility|business-ethics|stakeholder-capitalism|triple-bottom-line|shared-value|impact|purpose|mission|vision|values|culture|climate|atmosphere|morale|engagement|satisfaction|retention|loyalty|commitment|dedication|passion|enthusiasm|energy|drive|ambition|aspiration|goal-setting|target-setting|milestone|achievement|accomplishment|success|victory|triumph|win|gain|profit|revenue|growth|expansion|scale|size|magnitude|scope|reach|impact|influence|effect|outcome|result|consequence|implication|significance|importance|relevance|applicability|utility|usefulness|value|worth|merit|quality|excellence|superiority|advantage|benefit|gain|profit|return|roi|investment|cost|expense|budget|finance|accounting|economics|business|commerce|trade|industry|sector|market|segment|niche|customer|client|user|stakeholder|shareholder|investor|partner|vendor|supplier|contractor|consultant|advisor|mentor|coach|trainer|teacher|instructor|educator|facilitator|moderator|mediator|arbitrator|negotiator|diplomat|ambassador|representative|advocate|spokesperson|champion|leader|manager|supervisor|director|executive|officer|president|ceo|cfo|cto|cio|cmo|coo|founder|entrepreneur|intrapreneur|innovator|creator|inventor|designer|architect|engineer|developer|programmer|analyst|researcher|scientist|expert|specialist|professional|practitioner|technician|operator|worker|employee|staff|team-member|colleague|peer|associate|partner|collaborator|contributor|participant|volunteer|intern|apprentice|trainee|student|learner|novice|beginner|intermediate|advanced|expert|master|guru|ninja|rockstar|superstar|ace|pro|veteran|senior|junior|mid-level|entry-level|fresh|new|experienced|seasoned|mature|established|proven|tested|validated|verified|certified|qualified|licensed|accredited|authorized|approved|endorsed|recommended|trusted|reliable|dependable|consistent|stable|steady|solid|strong|robust|resilient|durable|lasting|enduring|sustainable|maintainable|scalable|extensible|modular|flexible|adaptable|agile|lean|efficient|effective|productive|performant|optimized|streamlined|simplified|elegant|clean|neat|tidy|organized|structured|systematic|methodical|disciplined|rigorous|thorough|comprehensive|complete|full|total|entire|whole|holistic|integrated|unified|coherent|consistent|aligned|balanced|harmonious|synergistic|collaborative|cooperative|team-oriented|people-focused|human-centered|user-centric|customer-focused|client-oriented|service-minded|helpful|supportive|caring|compassionate|kind|generous|giving|sharing|open|transparent|honest|truthful|sincere|genuine|authentic|real|original|unique|special|distinctive|different|diverse|varied|rich|broad|wide|deep|thorough|detailed|specific|precise|accurate|exact|correct|right|proper|appropriate|suitable|fitting|relevant|applicable|useful|practical|functional|operational|working|active|live|current|up-to-date|modern|contemporary|latest|newest|recent|fresh|cutting-edge|state-of-the-art|advanced|sophisticated|complex|complicated|challenging|difficult|hard|tough|demanding|rigorous|intensive|extensive|comprehensive|thorough|complete|full|total|entire|whole|holistic|integrated|unified|coherent|consistent|aligned|balanced|harmonious|synergistic)\b/)) {
    return 'Soft Skill';
  }
  
  // Default to Other for anything else
  return 'Other';
};
