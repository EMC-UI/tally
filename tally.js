/**
 * Created by cromed on 3/14/16.
 */
var request = require('superagent');
var pmongo = require('promised-mongo');
var _ = require('underscore');
var await = require('asyncawait/await');
var async = require('asyncawait/async');
var moment = require('moment');

/**
 * Create a db connection to the given db name.
 * @returns {*|exports}
 */
var getDbConnection = function () {
    return pmongo('mongodb://localhost:27017/tally');
};

var db = getDbConnection();

var baseUrl = 'http://ucas-stash.lss.emc.com/rest/api/1.0';
var projectsUrl = baseUrl + '/projects';
var reposUrl = '/repos';
var commitsUrl = '/commits';

var createData = async (function() {
    var dropDbs = [
        db.collection('commits').drop(),
        db.collection('repos').drop(),
        db.collection('projects').drop()
    ];
    await (dropDbs);
    console.log('clearDb done');

    loadProjectsToMongo();
});

createData();

var loadCommitsForRepo = function (repo) {
    if (!repo || !repo.project || !repo.project.link) {
        throw new Error('repo is not an object: ', repo);
        return;
    }
    var sevenDays = moment().subtract(7, 'd');

    var commitsUrl = baseUrl + repo.project.link.url + '/repos/' + repo.slug + '/commits?limit=200&withCounts=true';
    console.log('commitsUrl IS: ', commitsUrl);

    request.get(commitsUrl, function (err, res) {
        if (err) throw err;
        var response = JSON.parse(res.text);
        //  values; []
        //  size: 25,
        //  isLastPage: false,
        //  start: 0,
        //  limit: 25,
        //  nextPageStart: 25,
        //  authorCount: 31,
        //  totalCount: 8792
        //console.log('response.counts limit=', response.limit, 'totalCount=', response.totalCount);

        var commits = response.values;
        console.log('find commits', commits.length);

        //var earliestCommit = _.last(commits).authorTimestamp;
        //console.log('earliestCommit=', earliestCommit);

        var matchComments = _.filter(commits, function(commit) {
            return commit.authorTimestamp >= sevenDays && commit.parents.length===1;
        });
        console.log('find matchComments', matchComments.length);

        matchComments.forEach(function (commit) {
            //console.log('commit.authorTimestamp=', commit.authorTimestamp);
            commit.project = repo.project;
            commit.repo = repo.slug;
            //console.log(commit);
            db.collection('commits').insert(commit).then(function (message) {
                //console.log('commits done', message);
            }).catch(function (err) {
                console.log('commits error: ', err);
            });
        });

    });
};

var INTERESTING_REPOS = [
        'emc-ui', 'emc-web-sockets',
        'emc-server-common',
        'skyline-ui', 'skyline-ui-settings', 'skyline-ui-storage-assets', 'skyline-ui-protection'
    ];

var loadReposForProject = function (project) {
    if (!project || !project.link) {
        throw new Error('project is not an object: ', project);
        return;
    }
    var reportsUrl = baseUrl + project.link.url + reposUrl;
    console.log('reportsUrl IS: ', reportsUrl);

    request.get(reportsUrl, function (err, res) {
        if (err) throw err;
        var response = JSON.parse(res.text);
        var repos = response.values;
        //repos = [_.last(repos)];//limiter // BRM - ucas
        //repos = [repos[1]];//limiter SKUI - skyline-ui

        repos.forEach(function(repo) {
            if (_.contains(INTERESTING_REPOS, repo.name)) {
                console.log('repo.name=', repo.name);
                db.collection('repos').insert(repo).then(function (repo) {
                    console.log('find repos', repos.length);
                    loadCommitsForRepo(repo)
                }).catch(function (err) {
                    console.log('reposerror: ', err);
                });
            }
        });
    });
};

// BRM CSC CUC DR EM HVP RFLR POL RAP SKY SKUI HVU WKSP CUC
var INTERESTING_PROJECTS = ['CSC', 'CUC','SKUI'];

var loadProjectsToMongo = function () {
    console.log('projectsUrl is: ', projectsUrl);

    request.get(projectsUrl, function (err, res) {
        if (err) throw err;
        var response = JSON.parse(res.text);
        var projects = response.values;

        console.log('find projects', projects.length);
        //projects = [_.first(projects)];//limiter

        projects.forEach(function (project) {
            if (_.contains(INTERESTING_PROJECTS, project.key)) {
                console.log('project.key=', project.key);
                db.collection('projects').insert(project).then(function (project) {
                    loadReposForProject(project);
                }).catch(function (err) {
                    console.log('projects error: ', err);
                });
            }
        });
    });
};

//loadProjectsToMongo();

